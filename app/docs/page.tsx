
import { getDocsList } from '@/lib/docs-list';
import DocsList from './DocsList';

export default async function DocsPage() {
  const docs = await getDocsList();
  return <DocsList docs={docs} />;
}