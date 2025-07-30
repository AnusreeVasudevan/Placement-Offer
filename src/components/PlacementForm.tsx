import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FormSection } from "./FormSection";
import type { PlacementFormData } from "../types";


const fieldLabels: Record<string, string> = {
  id: "ID",
  candidateName: "Candidate Name",
  sstVivza: "SST/Vivza",
  location: "Location",
  poCountTotal: "PO Count Total",
  poCountAMD: "PO Count AMD",
  poCountGGR: "PO Count GGR",
  poCountLKO: "PO Count LKO",
  placementOfferID: "Placement Offer ID",
  personalPhone: "Personal Phone",
  email: "Email",
  fullAddress: "Full Address",
  jobType: "Job Type",
  positionApplied: "Position Applied",
  jobLocation: "Job Location",
  endClient: "End Client",
  vendorName: "Vendor Name",
  vendorTitle: "Vendor Title",
  vendorDirect: "Vendor Direct",
  vendorEmail: "Vendor Email",
  rate: "Rate",
  signupDate: "Signup Date",
  training: "Training",
  trainingDoneDate: "Training Done Date",
  joiningDate: "Joining Date",
  marketingStart: "Marketing Start",
  marketingEnd: "Marketing End",
  salesLeadBy: "Sales Lead By",
  salesPerson: "Sales Person",
  salesTeamLead: "Sales Team Lead",
  salesManager: "Sales Manager",
  supportBy: "Support By",
  interviewTeamLead: "Interview Team Lead",
  interviewManager: "Interview Manager",
  applicationBy: "Application By",
  recruiterName: "Recruiter Name",
  marketingTeamLead: "Marketing Team Lead",
  marketingManager: "Marketing Manager",
  agreementPercent: "Agreement Percent",
  agreementMonths: "Agreement Months",
  remarks: "Remarks",
};

const POForm: React.FC = () => {
  const initialState: PlacementFormData = {
    id: "",
    candidateName: "",
    sstVivza: "",
    location: "",
    poCountTotal: 0,
    poCountAMD: "",
    poCountGGR: "",
    poCountLKO: "",
    placementOfferID: "",
    personalPhone: "",
    email: "",
    fullAddress: "",
    jobType: "W2",
    positionApplied: "",
    jobLocation: "",
    endClient: "",
    vendorName: "",
    vendorTitle: "",
    vendorDirect: "",
    vendorEmail: "",
    rate: "",
    signupDate: "",
    training: "",
    trainingDoneDate: "",
    joiningDate: "",
    marketingStart: "",
    marketingEnd: "",
    salesLeadBy: "",
    salesPerson: "",
    salesTeamLead: "",
    salesManager: "",
    supportBy: "",
    interviewTeamLead: "",
    interviewManager: "",
    applicationBy: "",
    recruiterName: "",
    marketingTeamLead: "",
    marketingManager: "",
    agreementPercent: "",
    agreementMonths: "",
    remarks: "",
  };

  const [data, setData] = useState<PlacementFormData>({ ...initialState });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPopup, setShowPopup] = useState(false);
  const [submittedData, setSubmittedData] = useState<PlacementFormData | null>(null);

  const generatePOID = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const seq = Math.floor(100 + Math.random() * 900);
    return `PO-${yyyy}${mm}${dd}-${seq}`;
  };

  useEffect(() => {
    const id = generatePOID();
    setData((d) => ({ ...d, placementOfferID: id, id }));
  }, []);

  const formatCandidateName = (value: string) =>
    value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const validateField = (name: string, value: string): string => {
    let error = "";
    if (name === "candidateName" && !value.trim()) error = "Name is required.";
    if (name === "sstVivza" && !value) error = "Please select SST or Vivza.";
    if (name === "location" && !value) error = "Please select a location.";
    if (["poCountAMD", "poCountGGR", "poCountLKO"].includes(name) && value && Number(value) < 0)
      error = "PO count cannot be negative.";
    if (name === "personalPhone") {
      if (value && (!/^\d*$/.test(value) || value.length > 10)) {
        error = "Phone must be numeric and max 10 digits.";
      } else if (value.length > 0 && value.length < 10) {
        error = "Phone number must be 10 digits.";
      }
    }
    if (name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      error = "Invalid email format.";
    if (name === "vendorEmail" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      error = "Invalid vendor email format.";
    if (name === "rate" && value && (isNaN(Number(value)) || Number(value) < 0))
      error = "Rate must be a non-negative number.";
    if (name === "agreementPercent" && value && (Number(value) < 0 || Number(value) > 100))
      error = "Agreement % must be between 0 and 100.";
    if (name === "agreementMonths" && value && Number(value) < 0)
      error = "Agreement months must be non-negative.";
    return error;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newValue = name === "candidateName" ? formatCandidateName(value) : value;

    setData((prev) => {
      const updated = { ...prev, [name]: newValue };
      const amd = parseInt(updated.poCountAMD || "0", 10);
      const ggr = parseInt(updated.poCountGGR || "0", 10);
      const lko = parseInt(updated.poCountLKO || "0", 10);
      updated.poCountTotal = amd + ggr + lko;
      return updated;
    });

    setErrors((prev) => ({ ...prev, [name]: validateField(name, newValue) }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    let newErrors: Record<string, string> = {};

    Object.keys(data).forEach((field) => {
      const error = validateField(field, (data as any)[field]);
      if (error) newErrors[field] = error;
    });

    const today = new Date().toISOString().split("T")[0];
    if (data.joiningDate && data.joiningDate < today) {
      newErrors.joiningDate = "Joining date cannot be in the past.";
    }
    if (data.trainingDoneDate && data.trainingDoneDate > today) {
      newErrors.trainingDoneDate = "Training done date cannot be in the future.";
    }
    if (data.signupDate && data.joiningDate && data.signupDate > data.joiningDate) {
      newErrors.signupDate = "Signup date cannot be after joining date.";
    }
    if (data.marketingStart && data.marketingEnd && data.marketingEnd < data.marketingStart) {
      newErrors.marketingEnd = "Marketing end date cannot be before start date.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setSubmittedData(data);
      setShowPopup(true);
      localStorage.setItem("placementOfferForm", JSON.stringify(data));
      const id = generatePOID();
      setData({ ...initialState, placementOfferID: id, id });
      setErrors({});
    }
  };

  const copyTable = () => {
    const table = document.querySelector(".popup-table");
    if (!table) return;
    const range = document.createRange();
    range.selectNode(table);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    try {
      document.execCommand("copy");
      alert("Table copied as a real table! You can paste it into Word or Google Docs.");
    } catch {
      alert("Failed to copy table!");
    }
    selection?.removeAllRanges();
  };

  const downloadPDF = () => {
    if (!submittedData) return;
    const doc = new jsPDF();
    doc.text(submittedData.candidateName || "Submitted Data", 14, 15);
    const tableData = Object.entries(submittedData).map(([key, value]) => [
      fieldLabels[key] || key,
      value || "N/A",
    ]);
    autoTable(doc, {
      head: [["Field", "Value"]],
      body: tableData,
      startY: 20,
    });
    doc.save(`${submittedData.candidateName || "Submitted_Data"}.pdf`);
  };

  // Custom input renderer
  const renderInput = (
    label: string,
    name: keyof PlacementFormData,
    type = "text",
    isTextArea = false,
    options?: string[],
    readOnly = false
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      {options ? (
        <select
          name={name}
          value={data[name]}
          onChange={handleChange}
          disabled={readOnly}
          className={`w-full rounded-md bg-neutral-900 text-gray-100 border border-neutral-700 focus:border-accent-400 focus:ring-1 focus:ring-accent-400 p-2 ${readOnly ? "bg-neutral-800 cursor-not-allowed" : ""}`}
        >
          <option value="">Select</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : isTextArea ? (
        <textarea
          name={name}
          value={data[name]}
          onChange={handleChange}
          readOnly={readOnly}
          className={`w-full rounded-md bg-neutral-900 text-gray-100 border border-neutral-700 focus:border-accent-400 focus:ring-1 focus:ring-accent-400 p-2 ${readOnly ? "bg-neutral-800 cursor-not-allowed" : ""}`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={data[name]}
          onChange={handleChange}
          readOnly={readOnly}
          className={`w-full rounded-md bg-neutral-900 text-gray-100 border border-neutral-700 focus:border-accent-400 focus:ring-1 focus:ring-accent-400 p-2 ${readOnly ? "bg-neutral-800 cursor-not-allowed" : ""}`}
        />
      )}
      {errors[name] && <span className="text-red-400 text-xs">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-900 p-8">
      <div className="max-w-6xl mx-auto bg-neutral-800 p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">Placement Offer Submission Form</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Candidate */}
          <FormSection title="Candidate">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInput("Name of candidate", "candidateName")}
              {renderInput("SST/Vivza", "sstVivza", "text", false, ["SST", "Vivza"])}
              {renderInput("Location", "location", "text", false, [
                "Gurgaon",
                "Ahmedabad",
                "Noida",
                "Lucknow",
              ])}
            </div>
          </FormSection>

          {/* PO Details */}
          <FormSection title="PO Details">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {renderInput("Total PO Count", "poCountTotal", "number", false, undefined, true)}
              {renderInput("AMD", "poCountAMD", "number")}
              {renderInput("GGR", "poCountGGR", "number")}
              {renderInput("LKO", "poCountLKO", "number")}
              {renderInput("Placement Offer ID", "placementOfferID", "text", false, undefined, true)}
            </div>
          </FormSection>

          {/* Contact */}
          <FormSection title="Contact">
            {renderInput("Personal phone number", "personalPhone")}
            {renderInput("Email ID", "email")}
            {renderInput("Full Address", "fullAddress", "text", true)}
          </FormSection>

          {/* Position */}
          <FormSection title="Position">
            {renderInput("Type of Job", "jobType", "text", false, ["W2", "C2C", "FTE"])}
            {renderInput("Position Applied", "positionApplied")}
            {renderInput("Job Location", "jobLocation")}
          </FormSection>

          {/* Engagement */}
          <FormSection title="Engagement">
            {renderInput("Implementation/End client", "endClient")}
            {renderInput("Vendor Name", "vendorName")}
            {renderInput("Vendor Title", "vendorTitle")}
            {renderInput("Vendor Direct", "vendorDirect")}
            {renderInput("Vendor Email", "vendorEmail")}
            {renderInput("Rate", "rate")}
          </FormSection>

          {/* Dates & Status */}
          <FormSection title="Dates & Status">
            {renderInput("Signup Date", "signupDate", "date")}
            {renderInput("Training", "training", "text", false, ["Yes", "No"])}
            {renderInput("When training done", "trainingDoneDate", "date")}
            {renderInput("Joining Date", "joiningDate", "date")}
            {renderInput("Marketing Start Date", "marketingStart", "date")}
            {renderInput("Marketing End Date", "marketingEnd", "date")}
          </FormSection>

          {/* Org Coverage */}
          <FormSection title="Org Coverage">
            <h4 className="font-semibold text-gray-200 mt-2">Sales</h4>
            {renderInput("Sales Lead By", "salesLeadBy")}
            {renderInput("Sales Person", "salesPerson")}
            {renderInput("Sales Team Lead", "salesTeamLead")}
            {renderInput("Sales Manager", "salesManager")}
            {renderInput("Support By", "supportBy")}

            <h4 className="font-semibold text-gray-200 mt-2">Interview Support</h4>
            {renderInput("Interview Team Lead", "interviewTeamLead")}
            {renderInput("Interview Manager", "interviewManager")}

            <h4 className="font-semibold text-gray-200 mt-2">Marketing</h4>
            {renderInput("Application By", "applicationBy")}
            {renderInput("Recruiter Name", "recruiterName")}
            {renderInput("Marketing Team Lead", "marketingTeamLead")}
            {renderInput("Marketing Manager", "marketingManager")}
          </FormSection>

          {/* Agreement */}
          <FormSection title="Agreement">
            {renderInput("Agreement Percentage", "agreementPercent")}
            {renderInput("Agreement Months", "agreementMonths")}
          </FormSection>

          {/* Misc */}
          <FormSection title="Misc">
            {renderInput("Remarks/Notes (max 500 chars)", "remarks", "text", true)}
          </FormSection>

          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-primary-400 to-accent-400 text-white rounded-lg font-medium hover:from-primary-500 hover:to-accent-500 transition"
          >
            Submit
          </button>
        </form>
      </div>

      {/* Popup */}
      {showPopup && submittedData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-neutral-800 p-6 rounded-xl shadow-lg max-w-2xl w-full">
            <h2 className="text-xl font-bold text-primary-200 mb-4">
              {submittedData.candidateName || "Submitted Data"}
            </h2>
            <div className="overflow-auto max-h-80">
              <table className="popup-table w-full border border-neutral-700">
                <tbody>
                  {Object.entries(submittedData).map(([key, value]) => (
                    <tr key={key} className="border-b border-neutral-700">
                      <td className="p-2 font-medium bg-neutral-700 text-gray-100">{fieldLabels[key] || key}</td>
                      <td className="p-2 text-gray-200">{value || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={copyTable}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Copy
              </button>
              <button
                onClick={downloadPDF}
                className="px-4 py-2 bg-gradient-to-r from-primary-400 to-accent-400 text-white rounded hover:from-primary-500 hover:to-accent-500"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POForm;
