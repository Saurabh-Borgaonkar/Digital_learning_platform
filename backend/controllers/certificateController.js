const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');

// @desc    Get my certificates
// @route   GET /api/certificates
// @access  Student
const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user._id })
      .populate('course', 'title category thumbnail instructor')
      .populate('student', 'name email')
      .sort({ issuedAt: -1 });

    res.json({ success: true, count: certificates.length, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single certificate
// @route   GET /api/certificates/:id
// @access  Auth
const getCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('course', 'title category instructor')
      .populate('student', 'name email');

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    res.json({ success: true, certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate certificate manually
// @route   POST /api/certificates/generate
// @access  Student
const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
      isCompleted: true
    });

    if (!enrollment) {
      return res.status(400).json({ success: false, message: 'Course not completed yet' });
    }

    const existing = await Certificate.findOne({ student: req.user._id, course: courseId });
    if (existing) {
      return res.json({ success: true, message: 'Certificate already exists', certificate: existing });
    }

    const certId = `CERT-${Date.now()}-${req.user._id.toString().slice(-4).toUpperCase()}`;
    const certificate = await Certificate.create({
      student: req.user._id,
      course: courseId,
      certificateId: certId
    });

    res.status(201).json({ success: true, message: 'Certificate generated', certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMyCertificates, getCertificate, generateCertificate };
