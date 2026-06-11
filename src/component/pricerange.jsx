import React from "react";

const PriceRange = () => {

	const priceRanges = [
		{jenis:"Landing Page",range:"Rp 500.000 – Rp 3.000.000"},
		{jenis:"Personal/Portofolio",range:"Rp 1.000.000 – Rp 5.000.000"},
		{jenis:"Company Profile",range:"Rp 2.000.000 – Rp 20.000.000"},
		{jenis:"E-Commerce",range:"Rp 5.000.000 – Rp 50.000.000"},
		{jenis:"Website Custom",range:"Rp 500.000 – Rp 100.000.000+"},
	]

	return (

		<div className="min-h-screen bg-gray-50 p-8">
	      {/* Breadcrumb */}
	      <div className="flex items-center text-sm text-gray-500 mb-4">
	        <span>Admin</span>
	        <span className="mx-2">/</span>
	        <span className="text-violet-500 font-medium">PriceRange</span>
	      </div>
	      {/* Title */}
	      <h1 className="text-3xl font-bold text-gray-900 mb-8">Price Range</h1>

	      <div className="bg-white rounded-2xl shadow-md p-6 mb-10">
        	<h2 className="text-xl font-semibold mb-4">Acuan Harga</h2>
		      	<div className="overflow-x-auto">
		      		<table className="min-w-full text-sm border-collapse border border-gray-400">
		      			<thead>
		      				<tr className="text-left text-gray-700 border-b">
			      				<th className="py-2 px-3 font-bold border border-gray-300">Jenis Website</th>
			      				<th className="py-2 px-3 font-bold border border-gray-300">Rentang Harga</th>
		      				</tr>
		      			</thead>
		      			<tbody>
		      				{priceRanges.map((item, index) => (
		      					<tr key={index} className="text-left text-gray-500 border-b">
			      					<th className="py-2 px-3 font-semibold border border-gray-300">{item.jenis}</th>
			      					<th className="py-2 px-3 font-semibold border border-gray-300">{item.range}</th>
		      					</tr>
		      					))}
		      			</tbody>
		      		</table>
		      	</div>
	      </div>
	    </div>
	);
};

export default PriceRange;