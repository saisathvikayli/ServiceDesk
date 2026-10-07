import Ticket from '../models/Ticket.js';
import Asset from '../models/Asset.js';
import { checkAndFlagSlaBreaches } from '../utils/slaCalculator.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Run SLA check
    if (typeof checkAndFlagSlaBreaches === 'function') {
      await checkAndFlagSlaBreaches(Ticket);
    }

    // Match status values case-insensitively using regex or direct counts
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      escalatedTickets,
      totalAssets
    ] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: { $regex: /^open$/i } }),
      Ticket.countDocuments({ status: { $regex: /^in-progress$/i } }),
      Ticket.countDocuments({ status: { $regex: /^resolved$/i } }),
      Ticket.countDocuments({ isEscalated: true }),
      Asset.countDocuments()
    ]);

    // Top hardware assets linked to tickets
    const assetFaults = await Ticket.aggregate([
      { $match: { assetId: { $ne: null } } },
      { $group: { _id: '$assetId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'assets',
          localField: '_id',
          foreignField: '_id',
          as: 'asset'
        }
      },
      { $unwind: '$asset' }
    ]);

    res.json({
      summary: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        escalatedTickets,
        totalAssets
      },
      assetFaults: assetFaults.map((f) => ({
        assetId: f._id,
        name: f.asset.name || f.asset.assetName || 'Hardware Asset',
        serialNumber: f.asset.serialNumber || 'N/A',
        count: f.count
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 