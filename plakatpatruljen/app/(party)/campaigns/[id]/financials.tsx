import { Redirect, useLocalSearchParams } from 'expo-router';

export default function CampaignFinancialsRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={`/(party)/campaigns/${id}`} />;
}
