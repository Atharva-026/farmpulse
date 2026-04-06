const express = require('express');
const router = express.Router();
const DiseaseReport = require('../models/DiseaseReport');

const LOAN_SCHEMES = [
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC)',
    provider: 'Government of India — Ministry of Agriculture',
    maxAmount: 300000,
    interestRate: 4,
    repaymentPeriod: '12 months',
    eligibility: {
      minLandSize: 0.5,
      crops: 'all',
      description: 'Available to all farmers with valid land records'
    },
    applyUrl: 'https://www.pmkisan.gov.in',
    documents: ['Aadhaar Card', 'Land Records', 'Bank Account Details'],
    processingTime: '7-10 working days'
  },
  {
    id: 'pmfby',
    name: 'PM Fasal Bima Yojana (PMFBY)',
    provider: 'Government of India — Crop Insurance',
    maxAmount: 200000,
    interestRate: 2,
    repaymentPeriod: 'Season-based',
    eligibility: {
      minLandSize: 0,
      crops: 'all',
      description: 'Crop insurance scheme for all farmers'
    },
    applyUrl: 'https://pmfby.gov.in',
    documents: ['Aadhaar Card', 'Land Records', 'Bank Account', 'Crop Details'],
    processingTime: '15-20 working days'
  },
  {
    id: 'agri-infra',
    name: 'Agriculture Infrastructure Fund',
    provider: 'NABARD — National Bank for Agriculture',
    maxAmount: 1000000,
    interestRate: 3,
    repaymentPeriod: '36 months',
    eligibility: {
      minLandSize: 1,
      crops: 'all',
      description: 'For farmers with more than 1 acre land'
    },
    applyUrl: 'https://agriinfra.dac.gov.in',
    documents: ['Aadhaar Card', 'Land Records', 'Bank Account', 'Income Certificate'],
    processingTime: '10-15 working days'
  },
  {
    id: 'pm-kisan',
    name: 'PM-KISAN Scheme',
    provider: 'Government of India',
    maxAmount: 6000,
    interestRate: 0,
    repaymentPeriod: 'No repayment — direct benefit',
    eligibility: {
      minLandSize: 0,
      crops: 'all',
      description: '₹6000 per year direct income support to all farmers'
    },
    applyUrl: 'https://pmkisan.gov.in',
    documents: ['Aadhaar Card', 'Land Records', 'Bank Account'],
    processingTime: '3-5 working days'
  }
];

router.post('/match', async (req, res) => {
  try {
    const { farmerId, diseaseReportId, estimatedCost, landSize } = req.body;

    console.log('Loan Step 1 - Finding matching schemes for cost:', estimatedCost);

    const matchedSchemes = LOAN_SCHEMES.filter(scheme => {
      const meetsLandRequirement = landSize >= scheme.eligibility.minLandSize;
      const coversEnough = scheme.maxAmount >= estimatedCost;
      return meetsLandRequirement || coversEnough;
    });

    const ranked = matchedSchemes.sort((a, b) => {
      const aScore = (a.maxAmount >= estimatedCost ? 2 : 0) + (a.interestRate === 0 ? 2 : 4 - a.interestRate);
      const bScore = (b.maxAmount >= estimatedCost ? 2 : 0) + (b.interestRate === 0 ? 2 : 4 - b.interestRate);
      return bScore - aScore;
    });

    if (diseaseReportId) {
      await DiseaseReport.findByIdAndUpdate(diseaseReportId, { loanApplied: true });
    }

    console.log('Loan Step 2 - Matched schemes:', ranked.length);

    res.json({
      success: true,
      estimatedCost,
      matchedSchemes: ranked,
      recommendation: ranked[0]
    });

  } catch (err) {
    console.error('Loan ERROR:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/schemes', async (req, res) => {
  res.json({ success: true, schemes: LOAN_SCHEMES });
});

module.exports = router;