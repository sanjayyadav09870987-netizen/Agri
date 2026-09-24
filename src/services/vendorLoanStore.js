/**
 * AgriTradeX Vendor Loan & Crop Finance Management Store (Section 4: Crop Finance Hub)
 * Manages:
 * - Acreage-based loan eligibility calculation (1 Acre = ₹50,000)
 * - Farmer Land details, Document Verification (Passbook, Title Deed, Geo-photos)
 * - Strict verification requirement before loan approval
 * - Vendor loan review, formal agreement generation, and farmer acceptance sync
 */

const VENDOR_LOANS_STORAGE_KEY = 'agritradex_vendor_loans_v2';

// Configurable Loan Rate per Acre
export const LOAN_RATE_PER_ACRE = 50000;

export const SAMPLE_LAND_DOCUMENTS = [
  {
    id: 'doc_1',
    title: 'Land Pattadar Passbook / Title Deed',
    documentType: 'Official Government Land Record',
    thumbUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
    description: 'Pattadar Title Passbook verified against State Land Revenue Registry.'
  },
  {
    id: 'doc_2',
    title: 'Farm Survey Field Geo-Photo',
    documentType: 'Satellite & Field GPS Survey',
    thumbUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    description: 'Geo-tagged field boundary survey and soil condition inspection photograph.'
  },
  {
    id: 'doc_3',
    title: 'Land Revenue Tax Clearance Voucher',
    documentType: 'Tax Receipt',
    thumbUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    description: 'Current agricultural tax payment clearance from Village Revenue Officer (VRO).'
  }
];

export const calculateEligibleLoan = (acres) => {
  const numAcres = Number(acres) || 0;
  return Math.round(numAcres * LOAN_RATE_PER_ACRE);
};

// Seed 4 realistic farmer loan applications for Crop Finance Hub
export const getSeedVendorLoans = () => {
  return [
    {
      id: 'VLN-880192',
      farmerMobile: '9876543210',
      farmerDetails: {
        fullName: 'Ramesh Kumar',
        mobileNumber: '9876543210',
        aadhaarNumber: '123456789012',
        panNumber: 'ABCDE1234F',
        landAcres: 5.5,
        landSurveyNumber: 'SY-402/1A',
        village: 'Rampur',
        mandal: 'Shamirpet',
        district: 'Medchal',
        pincode: '500078'
      },
      landAcres: 5.5,
      landSurveyNumber: 'SY-402/1A',
      landDocuments: [
        SAMPLE_LAND_DOCUMENTS[0],
        SAMPLE_LAND_DOCUMENTS[1],
        SAMPLE_LAND_DOCUMENTS[2]
      ],
      landAddress: 'Survey No. 402/1A, Rampur Village, Shamirpet, Medchal - 500078',
      ratePerAcre: LOAN_RATE_PER_ACRE,
      calculatedEligibleAmount: 275000,
      requestedAmount: 250000,
      approvedAmount: null,
      selectedVendor: 'Apex Agri Traders Pvt Ltd',
      purpose: 'Drip irrigation infrastructure, hybrid cotton seeds & pre-harvest working capital',
      appliedDate: '23 Sep 2026',
      status: 'Loan Application Submitted', // 'Loan Application Submitted' | 'Under Vendor Review' | 'Loan Accepted' | 'Loan Rejected' | 'Agreement Pending' | 'Agreement Accepted' | 'Loan Amount Disbursed'
      documentVerificationStatus: 'not_verified', // 'not_verified' | 'verified' | 'rejected'
      verificationNotes: '',
      verifiedAt: null,
      agreement: null,
      disbursalInfo: null
    },
    {
      id: 'VLN-880193',
      farmerMobile: '9701122334',
      farmerDetails: {
        fullName: 'Venkata Reddy',
        mobileNumber: '9701122334',
        aadhaarNumber: '334455667788',
        panNumber: 'JKLMN9012P',
        landAcres: 4.0,
        landSurveyNumber: 'SY-204/B',
        village: 'Narsingi',
        mandal: 'Gandipet',
        district: 'Rangareddy',
        pincode: '500075'
      },
      landAcres: 4.0,
      landSurveyNumber: 'SY-204/B',
      landDocuments: [
        SAMPLE_LAND_DOCUMENTS[0],
        SAMPLE_LAND_DOCUMENTS[1]
      ],
      landAddress: 'Survey 204/B, Narsingi Farm Belt, Rangareddy - 500075',
      ratePerAcre: LOAN_RATE_PER_ACRE,
      calculatedEligibleAmount: 200000,
      requestedAmount: 200000,
      approvedAmount: null,
      selectedVendor: 'Apex Agri Traders Pvt Ltd',
      purpose: 'Bio-fertilizers, organic pest control & harvest labor advance for Maize cultivation',
      appliedDate: '24 Sep 2026',
      status: 'Loan Application Submitted',
      documentVerificationStatus: 'not_verified',
      verificationNotes: '',
      verifiedAt: null,
      agreement: null,
      disbursalInfo: null
    },
    {
      id: 'VLN-880194',
      farmerMobile: '9988776655',
      farmerDetails: {
        fullName: 'Balram Yadav',
        mobileNumber: '9988776655',
        aadhaarNumber: '778899001122',
        panNumber: 'QRSTU7890S',
        landAcres: 8.0,
        landSurveyNumber: 'SY-315/1',
        village: 'Gajwel',
        mandal: 'Gajwel',
        district: 'Siddipet',
        pincode: '502278'
      },
      landAcres: 8.0,
      landSurveyNumber: 'SY-315/1',
      landDocuments: [
        SAMPLE_LAND_DOCUMENTS[0],
        SAMPLE_LAND_DOCUMENTS[1],
        SAMPLE_LAND_DOCUMENTS[2]
      ],
      landAddress: 'Field 9, Gajwel Agri Center, Siddipet - 502278',
      ratePerAcre: LOAN_RATE_PER_ACRE,
      calculatedEligibleAmount: 400000,
      requestedAmount: 350000,
      approvedAmount: null,
      selectedVendor: 'Apex Agri Traders Pvt Ltd',
      purpose: 'Borewell deepening, solar pump set installation & Wheat crop season advance',
      appliedDate: '24 Sep 2026',
      status: 'Loan Application Submitted',
      documentVerificationStatus: 'not_verified',
      verificationNotes: '',
      verifiedAt: null,
      agreement: null,
      disbursalInfo: null
    },
    {
      id: 'VLN-880195',
      farmerMobile: '9848123456',
      farmerDetails: {
        fullName: 'Anjaiah Goud',
        mobileNumber: '9848123456',
        aadhaarNumber: '556677889900',
        panNumber: 'MNOPQ3456R',
        landAcres: 3.0,
        landSurveyNumber: 'SY-88/2',
        village: 'Toopran',
        mandal: 'Toopran',
        district: 'Medak',
        pincode: '502334'
      },
      landAcres: 3.0,
      landSurveyNumber: 'SY-88/2',
      landDocuments: [
        SAMPLE_LAND_DOCUMENTS[0],
        SAMPLE_LAND_DOCUMENTS[1]
      ],
      landAddress: 'Plot 12, Agro Hub, Toopran, Medak - 502334',
      ratePerAcre: LOAN_RATE_PER_ACRE,
      calculatedEligibleAmount: 150000,
      requestedAmount: 150000,
      approvedAmount: null,
      selectedVendor: 'Apex Agri Traders Pvt Ltd',
      purpose: 'High-yield chilli nursery inputs & mulch sheet installation',
      appliedDate: '24 Sep 2026',
      status: 'Loan Application Submitted',
      documentVerificationStatus: 'not_verified',
      verificationNotes: '',
      verifiedAt: null,
      agreement: null,
      disbursalInfo: null
    }
  ];
};

export const getStoredVendorLoans = () => {
  try {
    const raw = localStorage.getItem(VENDOR_LOANS_STORAGE_KEY);
    if (!raw) {
      const seed = getSeedVendorLoans();
      localStorage.setItem(VENDOR_LOANS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (parsed.length === 0) {
      const seed = getSeedVendorLoans();
      localStorage.setItem(VENDOR_LOANS_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading vendor loans', err);
    return [];
  }
};

export const saveVendorLoans = (loans) => {
  try {
    localStorage.setItem(VENDOR_LOANS_STORAGE_KEY, JSON.stringify(loans));
  } catch (err) {
    console.error('Error saving vendor loans', err);
  }
};

// Get active loan for a specific farmer
export const getFarmerActiveVendorLoan = (farmerMobile) => {
  const loans = getStoredVendorLoans();
  if (!farmerMobile) return null;
  return loans.find((l) => l.farmerMobile === farmerMobile) || null;
};

// 1. Farmer Submits Vendor Loan Application
export const submitVendorLoanApplication = (farmerUser, loanFormData) => {
  const loans = getStoredVendorLoans();
  const acres = Number(loanFormData.landAcres) || 1;
  const maxEligible = calculateEligibleLoan(acres);
  const requested = Math.min(Number(loanFormData.requestedAmount) || maxEligible, maxEligible);
  const now = new Date();

  // Check if existing application exists, replace or update
  const existingIdx = loans.findIndex((l) => l.farmerMobile === farmerUser?.mobileNumber);

  const newLoan = {
    id: 'VLN-' + Math.floor(100000 + Math.random() * 900000),
    farmerMobile: farmerUser?.mobileNumber || '9876543210',
    farmerDetails: {
      fullName: farmerUser?.fullName || 'Farmer Partner',
      mobileNumber: farmerUser?.mobileNumber || '',
      aadhaarNumber: farmerUser?.aadhaarNumber || '',
      panNumber: farmerUser?.panNumber || '',
      landAcres: acres,
      landSurveyNumber: loanFormData.landSurveyNumber || farmerUser?.landSurveyNumber || 'N/A',
      village: farmerUser?.village || '',
      mandal: farmerUser?.mandal || '',
      district: farmerUser?.district || '',
      pincode: farmerUser?.pincode || ''
    },
    landAcres: acres,
    landSurveyNumber: loanFormData.landSurveyNumber || farmerUser?.landSurveyNumber || 'N/A',
    landDocuments: loanFormData.landDocuments && loanFormData.landDocuments.length ? loanFormData.landDocuments : SAMPLE_LAND_DOCUMENTS,
    landAddress: loanFormData.landAddress || `${farmerUser?.village || ''}, ${farmerUser?.mandal || ''}, ${farmerUser?.district || ''} - ${farmerUser?.pincode || ''}`,
    ratePerAcre: LOAN_RATE_PER_ACRE,
    calculatedEligibleAmount: maxEligible,
    requestedAmount: requested,
    approvedAmount: null,
    selectedVendor: loanFormData.selectedVendor || 'Apex Agri Traders Pvt Ltd',
    purpose: loanFormData.purpose || 'Seasonal crop inputs, drip irrigation & pre-harvest working capital',
    appliedDate: now.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
    status: 'Loan Application Submitted', // 'Loan Application Submitted' | 'Under Vendor Review' | 'Loan Accepted' | 'Loan Rejected' | 'Agreement Pending' | 'Agreement Accepted' | 'Loan Amount Disbursed'
    documentVerificationStatus: 'not_verified',
    verificationNotes: '',
    verifiedAt: null,
    agreement: null,
    disbursalInfo: null
  };

  if (existingIdx >= 0) {
    loans[existingIdx] = newLoan;
  } else {
    loans.unshift(newLoan);
  }

  saveVendorLoans(loans);
  return newLoan;
};

import { apiClient } from './apiClient';

// 2. Vendor Document Verification Action
export const verifyLoanDocuments = (loanId, isVerified, notes = '') => {
  const loans = getStoredVendorLoans();
  const loan = loans.find((l) => l.id === loanId);
  if (!loan) return { success: false, message: 'Loan application not found.' };

  loan.documentVerificationStatus = isVerified ? 'verified' : 'not_verified';
  loan.verificationNotes = notes.trim();
  loan.verifiedAt = isVerified ? new Date().toISOString() : null;

  saveVendorLoans(loans);

  // Sync with Django backend
  try {
    apiClient.verifyVendorLoanDocuments(
      loanId,
      isVerified ? 'Documents Verified' : 'Documents Not Verified'
    ).catch(() => {});
  } catch (e) {}

  return {
    success: true,
    loan,
    message: isVerified
      ? '✓ Land documents and survey records have been marked as VERIFIED.'
      : 'Documents marked as NOT VERIFIED.'
  };
};

// 3. Vendor Reviews Loan Application (Accept or Reject)
// IMPORTANT RULE: Vendor MUST verify documents before approving/accepting a loan
export const reviewLoanByVendor = (loanId, decision, vendorUser, customTerms = {}) => {
  const loans = getStoredVendorLoans();
  const loan = loans.find((l) => l.id === loanId);
  if (!loan) return { success: false, message: 'Loan application not found.' };

  const now = new Date();

  if (decision === 'reject') {
    loan.status = 'Loan Rejected';
    loan.rejectedAt = now.toISOString();
    loan.rejectionReason = customTerms.reason || 'Land documentation / credit limit criteria not met.';
    saveVendorLoans(loans);

    // Sync with Django backend
    try {
      apiClient.reviewVendorLoan(loanId, {
        decision: 'reject',
        vendor_mobile: vendorUser?.mobileNumber,
        rejection_reason: loan.rejectionReason
      }).catch(() => {});
    } catch (e) {}

    return {
      success: true,
      loan,
      message: `✕ Loan application ${loan.id} has been rejected. Farmer notified.`
    };
  }

  if (decision === 'accept') {
    // STRICT VALIDATION: Documents MUST be verified before loan approval
    if (loan.documentVerificationStatus !== 'verified') {
      return {
        success: false,
        message: 'Mandatory Requirement: You must verify the farmer submitted land documents before accepting/approving the loan.'
      };
    }

    const approvedAmt = Number(customTerms.approvedAmount) || loan.requestedAmount;
    const vendorName = vendorUser?.companyName || loan.selectedVendor || 'Apex Agri Traders Pvt Ltd';
    const interestRate = customTerms.interestRate || '1.0% per month (Subsidized Pre-Harvest Trade Advance)';

    loan.status = 'Loan Accepted';
    loan.approvedAmount = approvedAmt;
    loan.lendingVendor = vendorName;
    loan.vendorId = vendorUser?.id || 'usr_vendor_default';
    loan.vendorContact = vendorUser?.fullName || 'Vendor Credit Manager';
    loan.vendorMobile = vendorUser?.mobileNumber || '';
    
    // Generate Formal Pre-Harvest Agreement Document
    loan.agreement = {
      agreementId: 'AGR-' + Math.floor(100000 + Math.random() * 900000),
      generatedDate: now.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
      lendingVendor: vendorName,
      borrowerFarmer: loan.farmerDetails.fullName,
      farmerLandSurvey: loan.landSurveyNumber,
      approvedLoanAmount: approvedAmt,
      interestRate: interestRate,
      tenureMonths: 6,
      mandatoryRule: 'The farmer must sell the crop to the same vendor according to the agreed loan terms.',
      clauses: [
        `1. PRINCIPAL ADVANCE: The Lending Vendor (${vendorName}) sanctions a pre-harvest advance of ₹${approvedAmt.toLocaleString('en-IN')} to Farmer (${loan.farmerDetails.fullName}) against registered survey land (${loan.landSurveyNumber}, ${loan.landAcres} Acres).`,
        `2. MANDATORY CROP SALE COVENANT: The Farmer hereby legally agrees and undertakes that the harvest crop produced on the designated land acres (${loan.landAcres} Acres) MUST be sold exclusively to ${vendorName} through AgriTradeX 24-hour bidding marketplace.`,
        `3. REPAYMENT & SETTLEMENT: The approved advance of ₹${approvedAmt.toLocaleString('en-IN')} along with applicable interest (${interestRate}) will be automatically settled and deducted from the gross proceeds of the farmer's crop sale at harvest time.`,
        `4. BINDING CONTRACT: Upon farmer's electronic acceptance in the Farmer Portal, this agreement becomes immutable, legally binding, and triggers direct bank fund disbursement.`
      ],
      isAcceptedByFarmer: false,
      acceptedAt: null,
      signatureHash: null
    };

    saveVendorLoans(loans);

    // Sync with Django backend
    try {
      apiClient.reviewVendorLoan(loanId, {
        decision: 'accept',
        vendor_mobile: vendorUser?.mobileNumber,
        approved_amount: approvedAmt,
        interest_rate: interestRate
      }).catch(() => {});
    } catch (e) {}

    return {
      success: true,
      loan,
      message: `🎉 Loan application ${loan.id} accepted! Formal agreement ${loan.agreement.agreementId} generated and transmitted to Farmer Portal for electronic acceptance.`
    };
  }

  return { success: false, message: 'Invalid decision.' };
};

// 4. Farmer Accepts Formal Loan Agreement -> Triggers Immediate Disbursal
export const acceptAgreementByFarmer = (loanId, farmerUser) => {
  const loans = getStoredVendorLoans();
  const loan = loans.find((l) => l.id === loanId);
  if (!loan || !loan.agreement) return { success: false, message: 'Loan agreement not found.' };

  const now = new Date();
  const sigHash = 'SIG_' + Math.random().toString(36).substring(2, 10).toUpperCase() + '_' + Date.now();

  // Lock Agreement
  loan.agreement.isAcceptedByFarmer = true;
  loan.agreement.acceptedAt = now.toISOString();
  loan.agreement.signatureHash = sigHash;
  loan.agreement.signerName = farmerUser?.fullName || loan.farmerDetails.fullName;

  // Change Status to Disbursed
  loan.status = 'Loan Amount Disbursed';
  loan.disbursalInfo = {
    disbursedAmount: loan.approvedAmount || loan.requestedAmount,
    disbursedDate: now.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    beneficiaryAccount: `Registered Bank Account (ending in ••••${farmerUser?.mobileNumber ? farmerUser.mobileNumber.slice(-4) : '4921'})`,
    utrReference: 'UTR' + Math.floor(1000000000 + Math.random() * 9000000000),
    lendingVendor: loan.lendingVendor || loan.selectedVendor,
    statusNote: 'Funds credited directly to farmer registered account. Repayment linked to crop harvest settlement.'
  };

  saveVendorLoans(loans);
  return { success: true, loan };
};

// Get loans for vendor portal
export const getVendorLoanApplications = (vendorUser) => {
  const loans = getStoredVendorLoans();
  return loans;
};
