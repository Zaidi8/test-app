import {canViewFeature, FeatureFlagName} from '@/lib/FeatureFlags';
import {getUser} from '@/lib/getUser';
import {ReactNode} from 'react';

interface FeatureEnabledProps {
  featureFlag: FeatureFlagName;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureEnabled({
  featureFlag,
  children,
  fallback,
}: FeatureEnabledProps) {
  const user = getUser();
  const isEnabled = canViewFeature(featureFlag, user);

  return <>{isEnabled ? children : fallback ?? null}</>;
}
