import React from 'react';
import './FieldCard.css';

function FieldCardSkeleton() {
  return (
    <div className="field-card skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton-icon shimmer"></div>
        <div className="skeleton-info">
          <div className="skeleton-title shimmer"></div>
          <div className="skeleton-badge shimmer"></div>
        </div>
      </div>
      <div className="skeleton-details">
        <div className="skeleton-detail shimmer"></div>
        <div className="skeleton-detail shimmer"></div>
      </div>
      <div className="skeleton-crop shimmer"></div>
      <div className="skeleton-sensors">
        <div className="skeleton-sensor shimmer"></div>
        <div className="skeleton-sensor shimmer"></div>
        <div className="skeleton-sensor shimmer"></div>
      </div>
      <div className="skeleton-button shimmer"></div>
    </div>
  );
}

export default FieldCardSkeleton;
