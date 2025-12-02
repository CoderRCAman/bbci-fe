import React, { FC, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';

interface RegistrationCrumbsProps {
  currentPageLabel: string;
}

const RegistrationCrumbs: FC<RegistrationCrumbsProps> = ({ currentPageLabel }) => {
 const [id , setId] = useState('') ;
  const steps = useMemo(() => [
    { label: 'Registration', path: '/tab1', order: 1 },
    { label: 'Residential History', path: '/tab5', order: 2 },
    { label: 'Personal Medical History', path: '/tab6', order: 3 },
    { label: 'Family History', path: '/tab7', order: 4 },
    { label: 'Anthropometry', path: '/tab8', order: 5 },
    { label: 'Indoor Air Pollution', path: '/tab9', order: 6 },
    { label: 'Tobacco and Alcohol', path: '/tab11', order: 7 },
    { label: 'Demographic Info', path: '/tab12', order: 8 },
  ], []);
  const location = useLocation() ; 
  useEffect(()=>{
    const searchParams = new URLSearchParams(location.search);
    console.log(searchParams?.get('id'))
    setId(searchParams?.get('id') || '');
  },[location.search])
  


  
  const currentStepOrder = useMemo(() => {
    return steps.find(step => step.label === currentPageLabel)?.order || 0;
  }, [currentPageLabel, steps]);

  return (
    
    <nav className="p-2 mx-2 bg-white rounded-md shadow mt-2 mb-6 max-w-6xl  border border-gray-100" aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap space-x-1 sm:space-x-1">
        
        
        {steps.map((step, index) => {
          const isCurrent = step.label === currentPageLabel;
          
          const isClickable = id || false; 
          const isFirstStep = index === 0;

          
          const textColor = isCurrent
            ? 'text-orange-600 font-bold' // Highlight current page
            : isClickable
            ? 'text-blue-600 hover:text-blue-800 transition duration-150' // Clickable link color
            : 'text-gray-500 cursor-default'; // Future/unreachable step

          const stepPath = `${step.path}${id ? `?id=${id}` : ''}`;

          return (
            <React.Fragment key={step.label}>
              
              {/* Separator: Only show the slash if it's NOT the first step */}
              {!isFirstStep && (
                <li className="text-gray-400 mx-1 flex items-center">
                  <span className="font-light text-base">/</span>
                </li>
              )}

              {/* Breadcrumb Item */}
              <li className="flex items-center truncate">
                {isCurrent || !isClickable ? (
                  // Current Page (Text - highlighted) or Future Step (Unclickable text - grayed out)
                  <span className={`text-sm font-semibold truncate ${textColor}`} aria-current={isCurrent ? 'page' : undefined}>
                    {step.label}
                  </span>
                ) : (
                  // Clickable Link (includes ID in the path)
                  <Link
                    to={stepPath}
                    style={{
                        textDecoration : 'none !important'
                    }}
                    className={`text-sm font-medium reg_link no-underline hover:underline truncate ${textColor}`}
                    aria-label={`Go to ${step.label}`}
                  >
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
export default RegistrationCrumbs;