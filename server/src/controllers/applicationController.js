const mongoose = require('mongoose');
const Application = require('../models/Application');
const { validateApplicationDates } = require('../utils/dateValidation');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    return res.status(200).json(application);
  } catch (error) {
    return next(error);
  }
};

const createApplication = async (req, res, next) => {
  try {
    const dateError = validateApplicationDates(req.body);
    if (dateError) {
      return res.status(400).json({ message: dateError });
    }

    const application = await Application.create(req.body);
    return res.status(201).json(application);
  } catch (error) {
    return next(error);
  }
};

const updateApplication = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID' });
    }

    const existingApplication = await Application.findById(req.params.id);
    if (!existingApplication) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const dateError = validateApplicationDates({
      dateApplied:
        req.body.dateApplied !== undefined
          ? req.body.dateApplied
          : existingApplication.dateApplied,
      nextActionDate:
        req.body.nextActionDate !== undefined
          ? req.body.nextActionDate
          : existingApplication.nextActionDate,
    });
    if (dateError) {
      return res.status(400).json({ message: dateError });
    }

    const application = await Application.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json(application);
  } catch (error) {
    return next(error);
  }
};

const deleteApplication = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid application ID' });
    }

    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
};
