import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

const LeadsList = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const navigate = useNavigate();

  const columnDefs = [
    {
      headerName: "Name",
      field: "full_name",
      valueGetter: (params) =>
        `${params.data.first_name || ""} ${params.data.last_name || ""}`.trim(),
      sortable: true,
      flex: 1,
    },
    { headerName: "Email", field: "email", sortable: true, flex: 1 },
    { headerName: "Phone", field: "phone", sortable: true, flex: 1 },
    { headerName: "Company", field: "company", sortable: true, flex: 1 },
    { headerName: "City", field: "city", sortable: true, flex: 1 },
    { headerName: "State", field: "state", sortable: true, flex: 1 },
    {
      headerName: "Status",
      field: "status",
      cellRenderer: (params) =>
        params.value ? params.value.toUpperCase() : "",
      sortable: true,
      flex: 1,
    },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: (params) => (
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            height: "100%",
          }}
        >
          <button
            className="btn btn-sm btn-outline btn-edit"
            onClick={() => navigate(`/leads/edit/${params.data.id}`)}
            style={{
              padding: "4px 8px",
              fontSize: "12px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-danger btn-delete"
            onClick={() => handleDelete(params.data.id)}
            style={{
              padding: "4px 8px",
              fontSize: "12px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      ),
      flex: 1,
      sortable: false,
      filter: false,
    },
  ];

  const fetchLeads = useCallback(
    async (page = 1, currentFilters = {}) => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: pagination.limit,
        };

        if (Object.keys(currentFilters).length > 0) {
          params.filters = JSON.stringify(currentFilters);
        }

        console.log("Fetching leads with params:", params);

        const response = await axios.get("/api/leads", {
          params,
          withCredentials: true,
        });

        console.log("Leads response:", response.data);

        setLeads(response.data.data || []);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages,
        });
      } catch (error) {
        console.error("Error fetching leads:", error);
        alert(
          "Failed to fetch leads. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit]
  );

  useEffect(() => {
    fetchLeads(1, filters);
  }, [fetchLeads, filters]);

  const handleDelete = async (id) => {
    if (!id) {
      alert("Invalid lead ID");
      return;
    }

    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        console.log("Deleting lead with ID:", id);

        await axios.delete(`/api/leads/${id}`, {
          withCredentials: true,
        });

        console.log("Lead deleted successfully");
        alert("Lead deleted successfully!");

        fetchLeads(pagination.page, filters);
      } catch (error) {
        console.error("Failed to delete lead:", error);

        if (error.response?.status === 404) {
          alert("Lead not found or already deleted");
        } else if (error.response?.status === 401) {
          alert("You are not authorized to delete this lead");
          navigate("/login");
        } else {
          alert("Failed to delete lead. Please try again.");
        }
      }
    }
  };

  const applyFilters = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newFilters = {};

    ["email", "company", "city"].forEach((field) => {
      const value = formData.get(field);
      if (value && value.trim()) {
        newFilters[field] = {
          type: "contains",
          filter: value.trim(),
        };
      }
    });

    ["status", "source"].forEach((field) => {
      const value = formData.get(field);
      if (value) {
        newFilters[field] = {
          type: "equals",
          filter: value,
        };
      }
    });

    const isQualified = formData.get("is_qualified");
    if (isQualified !== "") {
      newFilters.is_qualified = {
        type: isQualified === "true" ? "true" : "false",
      };
    }

    ["score", "lead_value"].forEach((field) => {
      const operator = formData.get(`${field}_operator`);
      const value1 = formData.get(`${field}_value1`);
      const value2 = formData.get(`${field}_value2`);

      if (value1) {
        if (operator === "between" && value2) {
          newFilters[field] = {
            type: "between",
            filter: parseFloat(value1),
            filterTo: parseFloat(value2),
          };
        } else {
          newFilters[field] = {
            type:
              operator === "gt"
                ? "greaterThan"
                : operator === "lt"
                ? "lessThan"
                : "equals",
            filter: parseFloat(value1),
          };
        }
      }
    });

    ["created_at", "last_activity_at"].forEach((field) => {
      const operator = formData.get(`${field}_operator`);
      const date1 = formData.get(`${field}1`);
      const date2 = formData.get(`${field}2`);

      if (date1) {
        if (operator === "between" && date2) {
          newFilters[field] = {
            type: "between",
            filter: date1,
            filterTo: date2,
          };
        } else {
          newFilters[field] = {
            type:
              operator === "before"
                ? "before"
                : operator === "after"
                ? "after"
                : "on",
            filter: date1,
          };
        }
      }
    });

    console.log("Applied filters:", newFilters);

    setFilters(newFilters);
    setShowFilterPanel(false);
  };

  const clearFilters = () => {
    setFilters({});
    setShowFilterPanel(false);
  };

  return (
    <div className="leads-container" style={{ padding: "20px" }}>
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>Leads Management</h1>
        <div>
          <button
            onClick={() => navigate("/leads/new")}
            className="btn btn-primary"
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              marginRight: "10px",
              cursor: "pointer",
            }}
          >
            Add New Lead
          </button>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="btn btn-primary"
            style={{
              padding: "10px 20px",
              backgroundColor: "#1f2328ff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {showFilterPanel ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </div>

      {showFilterPanel && (
        <div
          className="filter-panel"
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "20px",
            backgroundColor: "#f8f9fa",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h3 style={{ margin: 0 }}>Apply Filters</h3>
            <button
              type="button"
              onClick={clearFilters}
              style={{
                padding: "5px 10px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Clear All
            </button>
          </div>

          <form
            onSubmit={applyFilters}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
            }}
          >
            <div>
              <h4>Search Filters</h4>
              <input
                type="text"
                name="email"
                placeholder="Email..."
                style={{ width: "100%", padding: "8px", margin: "5px 0" }}
              />
              <input
                type="text"
                name="company"
                placeholder="Company..."
                style={{ width: "100%", padding: "8px", margin: "5px 0" }}
              />
              <input
                type="text"
                name="city"
                placeholder="City..."
                style={{ width: "100%", padding: "8px", margin: "5px 0" }}
              />
            </div>

            <div>
              <h4>Category Filters</h4>
              <select
                name="status"
                style={{ width: "100%", padding: "8px", margin: "5px 0" }}
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="lost">Lost</option>
                <option value="won">Won</option>
              </select>
              <select
                name="source"
                style={{ width: "100%", padding: "8px", margin: "5px 0" }}
              >
                <option value="">All Sources</option>
                <option value="website">Website</option>
                <option value="facebook_ads">Facebook Ads</option>
                <option value="google_ads">Google Ads</option>
                <option value="referral">Referral</option>
                <option value="events">Events</option>
                <option value="other">Other</option>
              </select>
              <select
                name="is_qualified"
                style={{ width: "100%", padding: "8px", margin: "5px 0" }}
              >
                <option value="">Any</option>
                <option value="true">Qualified</option>
                <option value="false">Not Qualified</option>
              </select>
            </div>

            <div>
              <h4>Score & Value</h4>
              <div style={{ marginBottom: "10px" }}>
                <select
                  name="score_operator"
                  style={{ width: "100%", padding: "8px", margin: "2px 0" }}
                >
                  <option value="equals">Score Equals</option>
                  <option value="gt">Score Greater than</option>
                  <option value="lt">Score Less than</option>
                  <option value="between">Score Between</option>
                </select>
                <input
                  type="number"
                  name="score_value1"
                  placeholder="Score"
                  min="0"
                  max="100"
                  style={{ width: "100%", padding: "8px", margin: "2px 0" }}
                />
                <input
                  type="number"
                  name="score_value2"
                  placeholder="Max (if between)"
                  min="0"
                  max="100"
                  style={{ width: "100%", padding: "8px", margin: "2px 0" }}
                />
              </div>
              <div>
                <select
                  name="lead_value_operator"
                  style={{ width: "100%", padding: "8px", margin: "2px 0" }}
                >
                  <option value="equals">Value Equals</option>
                  <option value="gt">Value Greater than</option>
                  <option value="lt">Value Less than</option>
                  <option value="between">Value Between</option>
                </select>
                <input
                  type="number"
                  name="lead_value_value1"
                  placeholder="Value"
                  min="0"
                  step="0.01"
                  style={{ width: "100%", padding: "8px", margin: "2px 0" }}
                />
                <input
                  type="number"
                  name="lead_value_value2"
                  placeholder="Max (if between)"
                  min="0"
                  step="0.01"
                  style={{ width: "100%", padding: "8px", margin: "2px 0" }}
                />
              </div>
            </div>

            <div>
              <h4>Date Filters</h4>
              <div style={{ marginBottom: "10px" }}>
                <select
                  name="created_at_operator"
                  style={{ width: "100%", padding: "8px", margin: "2px 0" }}
                >
                  <option value="on">Created On</option>
                  <option value="before">Created Before</option>
                  <option value="after">Created After</option>
                  <option value="between">Created Between</option>
                </select>
                <input
                  type="date"
                  name="created_at1"
                  style={{ width: "100%", padding: "8px", margin: "2px 0" }}
                />
                <input
                  type="date"
                  name="created_at2"
                  placeholder="End date (if between)"
                  style={{ width: "100%", padding: "8px", margin: "2px 0" }}
                />
              </div>
              <div>
                <select
                  name="last_activity_at_operator"
                  style={{ width: "100%", padding: "8px", margin: "2px 0" }}
                >
                  <option value="on">Last Activity On</option>
                  <option value="before">Last Activity Before</option>
                  <option value="after">Last Activity After</option>
                  <option value="between">Last Activity Between</option>
                </select>
                <input
                  type="date"
                  name="last_activity_at1"
                  style={{ width: "100%", padding: "8px", margin: "2px 0" }}
                />
                <input
                  type="date"
                  name="last_activity_at2"
                  placeholder="End date (if between)"
                  style={{ width: "100%", padding: "8px", margin: "2px 0" }}
                />
              </div>
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                justifyContent: "center",
                marginTop: "15px",
              }}
            >
              <button
                type="submit"
                style={{
                  padding: "10px 30px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>
      )}

      <div
        className="ag-theme-alpine"
        style={{ height: "600px", width: "100%", marginTop: "20px" }}
      >
        <AgGridReact
          columnDefs={columnDefs}
          rowData={leads}
          rowHeight={50}
          headerHeight={50}
          pagination={false}
          theme="legacy"
          defaultColDef={{
            resizable: true,
            sortable: true,
          }}
        />
      </div>

      {pagination.totalPages > 1 && (
        <div
          className="pagination"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "5px",
            marginTop: "20px",
          }}
        >
          <button
            onClick={() => fetchLeads(pagination.page - 1, filters)}
            disabled={pagination.page === 1}
            style={{
              padding: "8px 12px",
              backgroundColor: pagination.page === 1 ? "#e9ecef" : "#6c757d",
              color: pagination.page === 1 ? "#6c757d" : "white",
              border: "none",
              borderRadius: "4px",
              cursor: pagination.page === 1 ? "not-allowed" : "pointer",
            }}
          >
            Previous
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => fetchLeads(i + 1, filters)}
              style={{
                padding: "8px 12px",
                backgroundColor:
                  pagination.page === i + 1 ? "#007bff" : "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => fetchLeads(pagination.page + 1, filters)}
            disabled={pagination.page === pagination.totalPages}
            style={{
              padding: "8px 12px",
              backgroundColor:
                pagination.page === pagination.totalPages
                  ? "#e9ecef"
                  : "#6c757d",
              color:
                pagination.page === pagination.totalPages ? "#6c757d" : "white",
              border: "none",
              borderRadius: "4px",
              cursor:
                pagination.page === pagination.totalPages
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Next
          </button>

          <span style={{ marginLeft: "15px", color: "#6c757d" }}>
            Page {pagination.page} of {pagination.totalPages} (
            {pagination.total} total leads)
          </span>
        </div>
      )}

      {loading && (
        <div
          className="loading-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="spinner"
            style={{
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #007bff",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              animation: "spin 1s linear infinite",
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default LeadsList;
