import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const LeadForm = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    city: "",
    state: "",
    source: "website",
    status: "new",
    score: 0,
    lead_value: 0,
    last_activity_at: "",
    is_qualified: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const sourceOptions = [
    { value: "website", label: "Website" },
    { value: "facebook_ads", label: "Facebook Ads" },
    { value: "google_ads", label: "Google Ads" },
    { value: "referral", label: "Referral" },
    { value: "events", label: "Events" },
    { value: "other", label: "Other" },
  ];

  const statusOptions = [
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "qualified", label: "Qualified" },
    { value: "lost", label: "Lost" },
    { value: "won", label: "Won" },
  ];

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchLead(id);
    }
  }, [id]);

  const fetchLead = async (leadId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/leads/${leadId}`);
      const lead = response.data;

      setFormData({
        first_name: lead.first_name || "",
        last_name: lead.last_name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        company: lead.company || "",
        city: lead.city || "",
        state: lead.state || "",
        source: lead.source || "website",
        status: lead.status || "new",
        score: lead.score || 0,
        lead_value: lead.lead_value || 0,
        last_activity_at: lead.last_activity_at
          ? lead.last_activity_at.split("T")[0]
          : "",
        is_qualified: Boolean(lead.is_qualified),
      });
    } catch (error) {
      setError("Failed to fetch lead details");
      console.error("Error fetching lead:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submitData = {
        ...formData,
        score: parseInt(formData.score),
        lead_value: parseFloat(formData.lead_value),
        last_activity_at: formData.last_activity_at || null,
      };

      if (isEdit) {
        await axios.put(`/api/leads/${id}`, submitData);
      } else {
        await axios.post("/api/leads", submitData);
      }

      navigate("/leads");
    } catch (error) {
      setError(
        error.response?.data?.error ||
          `Failed to ${isEdit ? "update" : "create"} lead`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/leads");
  };

  if (loading && isEdit) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading lead details...</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>{isEdit ? "Edit Lead" : "Create New Lead"}</h1>
        <button onClick={handleCancel} className="btn btn-secondary">
          Back to Leads
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="lead-form">
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder="Enter first name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Company Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="company">Company</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Enter company name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Lead Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="source">Source *</label>
              <select
                id="source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                required
              >
                {sourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="score">Score (0-100)</label>
              <input
                type="number"
                id="score"
                name="score"
                value={formData.score}
                onChange={handleChange}
                min="0"
                max="100"
                placeholder="Enter lead score"
              />
            </div>
            <div className="form-group">
              <label htmlFor="lead_value">Lead Value ($)</label>
              <input
                type="number"
                id="lead_value"
                name="lead_value"
                value={formData.lead_value}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Enter lead value"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="last_activity_at">Last Activity Date</label>
              <input
                type="date"
                id="last_activity_at"
                name="last_activity_at"
                value={formData.last_activity_at}
                onChange={handleChange}
              />
            </div>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_qualified"
                  checked={formData.is_qualified}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                Is Qualified
              </label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
              ? "Update Lead"
              : "Create Lead"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;
