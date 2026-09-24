import Asset from "../models/Asset.js";
import LruCache from "../dsa/lruCache.js";

// same idea as the kb article cache - technicians re-check the same assets a lot
const assetCache = new LruCache(50);

export const createAsset = async (req, res) => {
  try {
    const asset = await Asset.create(req.body);
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAssets = async (_req, res) => {
  try {
    const assets = await Asset.find();
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAssetById = async (req, res) => {
  try {
    const cached = assetCache.get(req.params.id);
    if (cached) {
      return res.json(cached);
    }

    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    assetCache.set(req.params.id, asset);
    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    assetCache.delete(req.params.id);

    res.json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) return res.status(404).json({ message: "Asset not found" });

    assetCache.delete(req.params.id);

    res.json({ message: "Asset deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};