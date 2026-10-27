import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/db';
import { logger } from '../../lib/logger';
import { AncestorPathNode } from './commission.types';
import { COMMISSION_PLAN } from './commission-plan';

export class HierarchyResolverService {
  /**
   * Traverses up to 10 relative placement levels above the starting child node.
   *
   * STRICT BROKEN-PATH RULE:
   * - Traversal halts immediately if any parent link is missing or corrupted.
   * - Does NOT skip over broken links to reward upper ancestors.
   * - Prevents cycles and self-parenting.
   */
  static async resolveAncestorPath(
    childNetworkId: string,
    maxDepth: number = COMMISSION_PLAN.maxDepth,
    txClient?: Prisma.TransactionClient
  ): Promise<AncestorPathNode[]> {
    const db = txClient || prisma;
    const path: AncestorPathNode[] = [];
    const visitedNodes = new Set<string>([childNetworkId]);

    let currentChildId = childNetworkId;
    let relativeLevel = 1;

    while (relativeLevel <= maxDepth) {
      // 1. Locate placement record where current node is the child
      const placement = await db.networkPlacement.findUnique({
        where: { childNetworkId: currentChildId },
        select: {
          parentNetworkId: true,
          slotNumber: true,
          parentNetwork: {
            select: {
              id: true,
              ownerUserId: true,
              publicId: true,
              status: true,
              parentNetworkId: true,
            },
          },
        },
      });

      // Strict Path Check: If no placement record or parent is missing
      if (!placement || !placement.parentNetwork) {
        logger.debug('Upline traversal stopped: Root node reached or no higher placement', {
          meta: { currentChildId, relativeLevel },
        });
        break;
      }

      const parentNode = placement.parentNetwork;

      // Cycle & Self-Parenting Protection
      if (visitedNodes.has(parentNode.id)) {
        logger.error('Hierarchy cycle or self-parenting detected in placement tree! Halting traversal.', {
          meta: {
            detectedCycleNode: parentNode.id,
            relativeLevel,
            childNetworkId,
          },
        });
        break; // Strict halt on cycle
      }

      visitedNodes.add(parentNode.id);

      path.push({
        relativeLevel,
        networkId: parentNode.id,
        ownerUserId: parentNode.ownerUserId,
        publicId: parentNode.publicId,
        status: parentNode.status,
        parentNetworkId: parentNode.parentNetworkId,
        slotNumber: placement.slotNumber,
      });

      // Move up to parent for next iteration
      currentChildId = parentNode.id;
      relativeLevel++;
    }

    return path;
  }
}
