"use client";

import React from "react";
import { FiPackage } from "react-icons/fi";

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No products found",
  message = "Try adjusting your filters or search criteria",
  action,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <FiPackage />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__message">{message}</p>
      {action}
    </div>
  );
};

export default EmptyState;
