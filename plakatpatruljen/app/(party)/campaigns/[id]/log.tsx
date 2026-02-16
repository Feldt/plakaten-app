import { Redirect, useLocalSearchParams } from 'expo-router';

export default function CampaignLogRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={`/(party)/campaigns/${id}`} />;
}
