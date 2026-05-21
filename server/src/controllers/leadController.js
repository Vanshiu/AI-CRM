import Lead from '../models/Lead.js';

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private
export const createLead = async (req, res, next) => {
  try {
    const { customerName, email, phone, status, notes, followUpDate } = req.body;

    // Save lead under authenticated user's ID
    const lead = await Lead.create({
      customerName,
      email,
      phone,
      status,
      notes,
      followUpDate,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error(`[Lead Controller Error] Failed to create lead: ${error.message}`);
    
    // Pass validation errors to error middleware
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(val => val.message).join(', ')
      });
    }
    next(error);
  }
};

// @desc    Get all leads for logged in user
// @route   GET /api/leads
// @access  Private
export const getLeads = async (req, res, next) => {
  try {
    // Sort leads by newest first
    const leads = await Lead.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    console.error(`[Lead Controller Error] Failed to fetch leads: ${error.message}`);
    next(error);
  }
};

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
// @access  Private
export const getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, createdBy: req.user._id });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found or you are not authorized to view it.'
      });
    }

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error(`[Lead Controller Error] Failed to fetch lead: ${error.message}`);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.'
      });
    }
    next(error);
  }
};

// @desc    Update lead details
// @route   PUT /api/leads/:id
// @access  Private
export const updateLead = async (req, res, next) => {
  try {
    let lead = await Lead.findOne({ _id: req.params.id, createdBy: req.user._id });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found or you are not authorized to edit it.'
      });
    }

    // Perform selective updates on allowed fields
    const allowedFields = ['customerName', 'email', 'phone', 'status', 'notes', 'followUpDate'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        lead[field] = req.body[field];
      }
    });

    await lead.save();

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error(`[Lead Controller Error] Failed to update lead: ${error.message}`);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(val => val.message).join(', ')
      });
    }
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.'
      });
    }
    next(error);
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
export const deleteLead = async (req, res, next) => {
  try {
    const result = await Lead.deleteOne({ _id: req.params.id, createdBy: req.user._id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found or you are not authorized to delete it.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead successfully deleted.'
    });
  } catch (error) {
    console.error(`[Lead Controller Error] Failed to delete lead: ${error.message}`);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.'
      });
    }
    next(error);
  }
};
