import PageHeader from '../components/ui/PageHeader';
import { Card, CardBody } from '../components/ui/Card';

export default function Costs() {
	return (
		<div className="space-y-6">
			<PageHeader title="Costs" description="Track operational expenses across trucks, staff, and other items." />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardBody>
						<h3 className="font-medium">🚛 Truck Costs</h3>
						<ul className="mt-2 text-sm text-gray-700 list-disc pl-6">
							<li>Fuel</li>
							<li>Maintenance</li>
							<li>Insurance</li>
						</ul>
					</CardBody>
				</Card>
				<Card>
					<CardBody>
						<h3 className="font-medium">👷 Staff Costs</h3>
						<ul className="mt-2 text-sm text-gray-700 list-disc pl-6">
							<li>Driver Wages</li>
							<li>Admin Salaries</li>
							<li>Event Staff (as needed)</li>
						</ul>
					</CardBody>
				</Card>
				<Card className="md:col-span-2">
					<CardBody>
						<h3 className="font-medium">📦 Other Costs</h3>
						<p className="mt-2 text-sm text-gray-700">Add bins, disposal fees, permits, etc.</p>
					</CardBody>
				</Card>
			</div>
		</div>
	);
}
