import { prisma } from '../../lib/db';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../lib/errors';
import { logger } from '../../lib/logger';

export interface NetworkPlacementResult {
  parentId: string;
  slotNumber: number;
  isSpillover: boolean;
  sponsorId: string;
}

export class NetworkService {
  static readonly MAX_DIRECT_CHILDREN = 3;
  static readonly MAX_USER_NETWORK_IDS = 100;
  static readonly MAX_EARNING_DEPTH = 10;

  /**
   * Validates a sponsor referral code against active network IDs in the database.
   */
  static async validateReferralCode(code: string) {
    if (!code || code.trim().length === 0) {
      throw new BadRequestError('Referral code must not be empty');
    }

    const trimmed = code.trim().toUpperCase();
    const node = await prisma.networkId.findUnique({
      where: { referralCode: trimmed },
      include: {
        ownerUser: {
          select: { fullName: true, status: true },
        },
        parentPlacements: {
          select: { slotNumber: true, childNetworkId: true },
        },
      },
    });

    if (!node) {
      throw new BadRequestError(`Invalid referral code: "${trimmed}"`);
    }

    if (node.status !== 'ACTIVE') {
      throw new BadRequestError(`Referral code belongs to a non-active node (${node.status})`);
    }

    const rawPlacements = (node as any).parentPlacements || (node as any).placements || [];
    const occupiedSlots = rawPlacements.map((p: any) => p.slotNumber);
    const availableSlots = [1, 2, 3].filter((s: number) => !occupiedSlots.includes(s));

    return {
      valid: true,
      node: {
        id: node.id,
        publicId: node.publicId,
        referralCode: node.referralCode,
        ownerUserId: node.ownerUserId,
        ownerName: node.ownerUser.fullName,
        placementDepth: node.placementDepth,
        status: node.status,
        occupiedSlots,
        availableDirectSlots: availableSlots,
      },
    };
  }

  /**
   * Determines the placement parent and slot for a new node.
   * If sponsor has an open slot, assigns directly.
   * If sponsor is full (all 3 slots occupied), performs breadth-first downline traversal (spillover).
   */
  static async findPlacementSlot(
    sponsorNetworkId: string,
    preferredSlot?: number,
    dbClient: any = prisma
  ): Promise<NetworkPlacementResult> {
    const sponsor = await dbClient.networkId.findUnique({
      where: { id: sponsorNetworkId },
      include: {
        parentPlacements: true,
      },
    });

    if (!sponsor || sponsor.status !== 'ACTIVE') {
      throw new BadRequestError('Sponsor network node is invalid or inactive');
    }

    const sponsorPlacements = sponsor.parentPlacements || sponsor.placements || [];
    const occupiedSlots = new Set(sponsorPlacements.map((p: any) => p.slotNumber));

    // Check if preferred slot is requested and open
    if (preferredSlot && preferredSlot >= 1 && preferredSlot <= 3 && !occupiedSlots.has(preferredSlot)) {
      return {
        parentId: sponsor.id,
        slotNumber: preferredSlot,
        isSpillover: false,
        sponsorId: sponsor.id,
      };
    }

    // Assign lowest available direct slot under sponsor
    for (let slot = 1; slot <= 3; slot++) {
      if (!occupiedSlots.has(slot)) {
        return {
          parentId: sponsor.id,
          slotNumber: slot,
          isSpillover: false,
          sponsorId: sponsor.id,
        };
      }
    }

    // Direct slots are full -> Breadth-first spillover search
    const queue: string[] = sponsorPlacements
      .sort((a: any, b: any) => a.slotNumber - b.slotNumber)
      .map((p: any) => p.childNetworkId);

    while (queue.length > 0) {
      const currentParentId = queue.shift()!;
      const currentParent = await dbClient.networkId.findUnique({
        where: { id: currentParentId },
        include: { parentPlacements: true },
      });

      if (!currentParent || currentParent.status !== 'ACTIVE') {
        continue;
      }

      const currentPlacements = currentParent.parentPlacements || currentParent.placements || [];
      const currentOccupied = new Set(currentPlacements.map((p: any) => p.slotNumber));
      for (let slot = 1; slot <= 3; slot++) {
        if (!currentOccupied.has(slot)) {
          return {
            parentId: currentParent.id,
            slotNumber: slot,
            isSpillover: true,
            sponsorId: sponsor.id,
          };
        }
      }

      // Enqueue child nodes for next breadth-level inspection
      for (const p of currentPlacements.sort((a: any, b: any) => a.slotNumber - b.slotNumber)) {
        queue.push(p.childNetworkId);
      }
    }

    throw new Error('Unable to find available placement slot in downline hierarchy');
  }

  /**
   * Verifies that the user has not exceeded the maximum of 100 network IDs.
   */
  static async assertUserCanOwnNetworkId(userId: string): Promise<number> {
    const count = await prisma.networkId.count({
      where: { ownerUserId: userId },
    });

    if (count >= this.MAX_USER_NETWORK_IDS) {
      throw new BadRequestError(
        `User account has reached the maximum allowed limit of ${this.MAX_USER_NETWORK_IDS} network IDs`
      );
    }

    return count;
  }

  static async listUserNetworkIds(ownerUserId: string) {
    const nodes = await prisma.networkId.findMany({
      where: { ownerUserId },
      include: {
        parentPlacements: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return nodes.map((node) => {
      const children = (node as any).parentPlacements || (node as any).placements || [];
      return {
        id: node.id,
        publicId: node.publicId,
        referralCode: node.referralCode,
        ownerUserId: node.ownerUserId,
        parentNetworkId: node.parentNetworkId,
        placementDepth: node.placementDepth,
        childCount: children.length,
        status: node.status,
        createdAt: node.createdAt,
      };
    });
  }

  /**
   * Retrieves single NetworkId with strict ownership verification.
   */
  static async getNetworkIdDetails(nodeIdOrPublicId: string, ownerUserId?: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nodeIdOrPublicId);
    const whereClause = isUuid ? { id: nodeIdOrPublicId } : { publicId: nodeIdOrPublicId };

    const node = await prisma.networkId.findFirst({
      where: whereClause,
      include: {
        parentNetwork: {
          select: { id: true, publicId: true, referralCode: true },
        },
        parentPlacements: {
          select: { slotNumber: true, childNetworkId: true },
        },
      },
    });

    if (!node) {
      throw new NotFoundError(`Network node "${nodeIdOrPublicId}" not found`);
    }

    if (ownerUserId && node.ownerUserId !== ownerUserId) {
      throw new ForbiddenError('You do not have permission to access this network node');
    }

    const children = (node as any).parentPlacements || (node as any).placements || [];

    return {
      id: node.id,
      publicId: node.publicId,
      referralCode: node.referralCode,
      ownerUserId: node.ownerUserId,
      parentNetworkId: node.parentNetworkId,
      parent: node.parentNetwork,
      placementDepth: node.placementDepth,
      status: node.status,
      occupiedSlots: children.map((p: any) => p.slotNumber),
      directChildrenCount: children.length,
      createdAt: node.createdAt,
    };
  }

  /**
   * Retrieves authorized direct children (slots 1..3) under an owned NetworkId.
   */
  static async getDirectChildren(nodeIdOrPublicId: string, ownerUserId?: string) {
    const parentNode = await this.getNetworkIdDetails(nodeIdOrPublicId, ownerUserId);

    const placements = await prisma.networkPlacement.findMany({
      where: { parentNetworkId: parentNode.id },
      include: {
        childNetwork: {
          select: {
            id: true,
            publicId: true,
            referralCode: true,
            ownerUserId: true,
            status: true,
            placementDepth: true,
            createdAt: true,
            ownerUser: {
              select: { fullName: true },
            },
          },
        },
      },
      orderBy: { slotNumber: 'asc' },
    });

    // Map all 3 potential slots
    const slots = [1, 2, 3].map((slotNum) => {
      const match = placements.find((p) => p.slotNumber === slotNum);
      if (!match) {
        return {
          slotNumber: slotNum,
          occupied: false,
          child: null,
        };
      }
      return {
        slotNumber: slotNum,
        occupied: true,
        child: {
          id: match.childNetwork.id,
          publicId: match.childNetwork.publicId,
          referralCode: match.childNetwork.referralCode,
          ownerName: match.childNetwork.ownerUser.fullName,
          status: match.childNetwork.status,
          joinedAt: match.childNetwork.createdAt,
        },
      };
    });

    return {
      nodeId: parentNode.id,
      publicId: parentNode.publicId,
      slots,
      totalChildren: placements.length,
    };
  }

  /**
   * Retrieves referral information for the owned NetworkId.
   */
  static async getReferralInfo(nodeIdOrPublicId: string, ownerUserId?: string) {
    const node = await this.getNetworkIdDetails(nodeIdOrPublicId, ownerUserId);

    const directReferralsCount = await prisma.networkId.count({
      where: { parentNetworkId: node.id },
    });

    return {
      id: node.id,
      publicId: node.publicId,
      referralCode: node.referralCode,
      referralLink: `/register?ref=${encodeURIComponent(node.referralCode)}`,
      status: node.status,
      directReferralsCount,
    };
  }
}
