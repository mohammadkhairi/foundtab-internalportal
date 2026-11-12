import CreateOrgForm from './CreateOrgForm'
import Link from 'next/link'

export default function NewOrgPage() {
  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/orgs" className="text-sm text-brand-600 hover:text-brand-800">&larr; Organisations</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">New Organisation</h1>
        <p className="text-sm text-gray-500 mt-0.5">Create an organisation manually without Clerk.</p>
      </div>
      <CreateOrgForm />
    </div>
  )
}
