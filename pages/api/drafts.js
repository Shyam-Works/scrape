import dbConnect from '../../lib/mongodb';
import Draft from '../../models/Draft';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { _id, ...draftData } = req.body;

      // If _id is provided, update existing draft
      if (_id) {
        const updatedDraft = await Draft.findByIdAndUpdate(
          _id,
          { ...draftData, status: 'draft' },
          { new: true, runValidators: true }
        );

        if (!updatedDraft) {
          return res.status(404).json({ error: 'Draft not found' });
        }

        return res.status(200).json({ 
          message: 'Draft updated successfully',
          draft: updatedDraft 
        });
      }

      // Create new draft
      const draft = new Draft({
        ...draftData,
        status: 'draft',
      });

      await draft.save();

      res.status(201).json({ 
        message: 'Draft saved successfully',
        draft 
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      res.status(500).json({ error: 'Failed to save draft' });
    }
  } else if (req.method === 'GET') {
    try {
      // Get all drafts
      const drafts = await Draft.find({ status: 'draft' })
        .sort({ updatedAt: -1 });

      res.status(200).json({ drafts });
    } catch (error) {
      console.error('Error fetching drafts:', error);
      res.status(500).json({ error: 'Failed to fetch drafts' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Draft ID required' });
      }

      await Draft.findByIdAndDelete(id);

      res.status(200).json({ message: 'Draft deleted successfully' });
    } catch (error) {
      console.error('Error deleting draft:', error);
      res.status(500).json({ error: 'Failed to delete draft' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}