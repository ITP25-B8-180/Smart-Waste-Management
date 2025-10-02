import PageHeader from '../components/ui/PageHeader';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function Billing() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Billing"
				description="Calculate monthly fees per user and manage billing runs."
				actions={<Button>Run Calculation</Button>}
			/>
			<Card>
				<CardHeader>
					<h3 className="font-medium">Current Period Summary</h3>
					<p className="mt-1 text-sm text-gray-600">Preview totals before finalizing invoices.</p>
				</CardHeader>
				<CardBody>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="rounded-lg bg-emerald-50 p-4">
							<p className="text-sm text-emerald-700">Households</p>
							<p className="text-xl font-semibold text-emerald-900">0</p>
						</div>
						<div className="rounded-lg bg-sky-50 p-4">
							<p className="text-sm text-sky-700">Total Pickups</p>
							<p className="text-xl font-semibold text-sky-900">0</p>
						</div>
						<div className="rounded-lg bg-amber-50 p-4">
							<p className="text-sm text-amber-700">Projected Revenue</p>
							<p className="text-xl font-semibold text-amber-900">LKR 0.00</p>
						</div>
					</div>
				</CardBody>
			</Card>
			<Card className="overflow-hidden">
				<CardBody className="p-0">
					<div className="max-h-96 overflow-auto">
						<Table>
							<THead>
								<tr>
									<TH>User</TH>
									<TH>Pickups</TH>
									<TH>Weight (kg)</TH>
									<TH>Amount (LKR)</TH>
									<TH>Status</TH>
									<TH>Actions</TH>
								</tr>
							</THead>
							<TBody>
								<TR>
									<TD>Sample User</TD>
									<TD>0</TD>
									<TD>0</TD>
									<TD>0.00</TD>
									<TD><Badge variant="warning">Pending</Badge></TD>
									<TD>
										<Button variant="secondary" size="sm" className="mr-2">Preview</Button>
										<Button size="sm">Generate</Button>
									</TD>
								</TR>
							</TBody>
						</Table>
					</div>
				</CardBody>
			</Card>
			<p className="text-center text-sm text-gray-600">No more records to display.</p>
		</div>
	);
}
