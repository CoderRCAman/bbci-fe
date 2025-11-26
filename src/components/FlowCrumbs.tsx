import React, { FC, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

type StepDef = { label: string; path: string; order?: number };

interface FlowCrumbsProps {
  steps: StepDef[];
  currentPageLabel: string;
  idQueryParam?: string; // e.g. "master_id" or "user_id"
}

const FlowCrumbs: FC<FlowCrumbsProps> = ({ steps, currentPageLabel, idQueryParam = "master_id" }) => {
  const location = useLocation();
  const [id, setId] = useState("");

  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    setId(qs.get(idQueryParam) || "");
  }, [location.search, idQueryParam]);

  const buildStepPath = (stepPath: string) => {
    const currentQuery = location.search; // includes leading "?". Empty string if none

    const [base] = stepPath.split("?"); // ignore any query in step definition (safe)

    // Keep the full existing query string exactly as it is
    return currentQuery ? `${base}${currentQuery}` : base;
  };

  return (
    <nav className="p-2 mx-2 bg-white rounded-md shadow mt-2 mb-6 max-w-6xl border border-gray-100" aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap space-x-1 sm:space-x-1">
        {steps.map((step, index) => {
          const isCurrent = step.label === currentPageLabel;
          const isClickable = !!id;
          const isFirstStep = index === 0;

          const textColor = isCurrent
            ? "text-orange-600 font-bold"
            : isClickable
              ? "text-blue-600 hover:text-blue-800 transition duration-150"
              : "text-gray-500 cursor-default";

          const stepPath = buildStepPath(step.path);

          return (
            <React.Fragment key={step.label}>
              {!isFirstStep && (
                <li className="text-gray-400 mx-1 flex items-center">
                  <span className="font-light text-base">/</span>
                </li>
              )}
              <li className="flex items-center truncate">
                {isCurrent || !isClickable ? (
                  <span className={`text-sm font-semibold truncate ${textColor}`} aria-current={isCurrent ? "page" : undefined}>
                    {step.label}
                  </span>
                ) : (
                  <Link to={stepPath} className={`text-sm font-medium reg_link no-underline hover:underline truncate ${textColor}`} aria-label={`Go to ${step.label}`}>
                    {step.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default FlowCrumbs;
