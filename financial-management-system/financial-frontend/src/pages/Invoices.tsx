import PageHeader from '../components/ui/PageHeader';
import { Card, CardBody } from '../components/ui/Card';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function Invoices() {
	return (
		<div className="space-y-6">
			<PageHeader title="Invoices" description="List of generated invoices and their payment status." />
			<Card className="overflow-hidden">
				<CardBody className="p-0">
					<div className="max-h-96 overflow-auto">
						<Table>
							<THead>
								<tr>
									<TH>Invoice #</TH>
									<TH>User</TH>
									<TH>Month</TH>
									<TH>Amount (LKR)</TH>
									<TH>Status</TH>
									<TH>Actions</TH>
								</tr>
							</THead>
							<TBody>
								<TR className="hover:bg-emerald-50">
									<TD>INV-0001</TD>
									<TD>Sample User</TD>
									<TD>2025-09</TD>
									<TD>0.00</TD>
									<TD><Badge variant="warning">Unpaid</Badge></TD>
									<TD>
										<Button variant="secondary" size="sm" className="mr-2">View</Button>
										<Button size="sm">Mark Paid</Button>
									</TD>
								</TR>
							</TBody>
						</Table>
					</div>
				</CardBody>
			</Card>
		</div>
	);
}
