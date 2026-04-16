"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type ProductCatalogItem = {
	id: number;
	categoryLabel: string;
	name: string;
	summary: string;
	image: string;
	features: string[];
	videos: string[];
};

type ProductsCatalogProps = {
	heading: string;
	description: string;
	categories: string[];
	allLabel: string;
	videosLabel: string;
	viewDetailLabel: string;
	closeLabel: string;
	items: ProductCatalogItem[];
};

export default function ProductsCatalog({
	heading,
	description,
	categories,
	allLabel,
	videosLabel,
	viewDetailLabel,
	closeLabel,
	items,
}: ProductsCatalogProps) {
	const [activeCategory, setActiveCategory] = useState(allLabel);
	const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

	const filterOptions = useMemo(() => [allLabel, ...categories], [allLabel, categories]);
	const filteredItems = useMemo(() => {
		if (activeCategory === allLabel) {
			return items;
		}
		return items.filter((item) => item.categoryLabel === activeCategory);
	}, [activeCategory, allLabel, items]);
	const selectedProduct = useMemo(
		() => filteredItems.find((item) => item.id === selectedProductId) ?? null,
		[filteredItems, selectedProductId],
	);

	return (
		<div className="mx-auto max-w-6xl px-4 py-12">
			<h1 className="text-3xl font-bold text-slate-900 md:text-4xl">{heading}</h1>
			<p className="mt-3 max-w-3xl text-sm text-slate-700 md:text-base">{description}</p>

			<div className="mt-8 flex flex-wrap gap-2">
				{filterOptions.map((category) => {
					const isActive = activeCategory === category;
					return (
						<button
							key={category}
							type="button"
							onClick={() => setActiveCategory(category)}
							className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
								isActive
									? "bg-gradient-to-r from-emerald-700 to-green-500 text-white shadow-md shadow-emerald-700/30"
									: "border border-emerald-100 bg-[#fcfefb] text-slate-700 hover:border-emerald-300 hover:text-emerald-800"
							}`}
						>
							{category}
						</button>
					);
				})}
			</div>

			<div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
				{filteredItems.map((product) => (
					<article
						key={product.id}
						className="overflow-hidden rounded-2xl border border-emerald-100 bg-[#fcfefb] shadow-sm shadow-emerald-900/5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/10"
					>
						<div className="relative">
							{product.image ? (
								<Image src={product.image} alt={product.name} width={960} height={540} className="aspect-video w-full object-cover" />
							) : null}
							<div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
							<p className="absolute bottom-3 left-3 inline-flex rounded-full bg-emerald-50/92 px-3 py-1 text-xs font-semibold text-emerald-900">{product.categoryLabel}</p>
						</div>
						<div className="p-5 md:p-6">
							<h2 className="text-xl font-semibold text-slate-900">{product.name}</h2>
							<p className="mt-2 text-sm text-slate-600">{product.summary}</p>

							<ul className="mt-4 grid gap-2 text-sm text-slate-700">
								{product.features.slice(0, 3).map((feature) => (
									<li key={feature} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
										{feature}
									</li>
								))}
							</ul>

							<button
								type="button"
								onClick={() => setSelectedProductId(product.id)}
								className="mt-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
							>
								{viewDetailLabel}
							</button>

							{product.videos.length > 0 ? (
								<div className="mt-5">
									<h3 className="text-sm font-semibold text-slate-900">{videosLabel}</h3>
									<div className="mt-2 space-y-3">
										{product.videos.slice(0, 1).map((videoUrl) => (
											<video key={videoUrl} src={videoUrl} controls className="w-full rounded-lg border border-slate-200 bg-black/90" />
										))}
									</div>
								</div>
							) : null}
						</div>
					</article>
				))}
			</div>

			{selectedProduct ? (
				<div className="fixed inset-0 z-50 flex items-end bg-slate-950/55 p-0 md:items-center md:justify-center md:p-6" onClick={() => setSelectedProductId(null)}>
					<div
						className="max-h-[88vh] w-full overflow-auto rounded-t-3xl bg-[#fcfefb] p-5 shadow-2xl md:max-w-2xl md:rounded-2xl md:p-6"
						onClick={(event) => event.stopPropagation()}
					>
						<div className="mb-4 flex items-start justify-between gap-3">
							<div>
								<p className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{selectedProduct.categoryLabel}</p>
								<h3 className="mt-2 text-2xl font-bold text-slate-900">{selectedProduct.name}</h3>
							</div>
							<button
								type="button"
								onClick={() => setSelectedProductId(null)}
								className="rounded-full border border-emerald-100 px-3 py-1 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50"
							>
								{closeLabel}
							</button>
						</div>

						{selectedProduct.image ? (
							<Image
								src={selectedProduct.image}
								alt={selectedProduct.name}
								width={960}
								height={540}
								className="aspect-video w-full rounded-xl object-cover"
							/>
						) : null}
						<p className="mt-4 text-sm leading-6 text-slate-700">{selectedProduct.summary}</p>

						<ul className="mt-4 grid gap-2 text-sm text-slate-700">
							{selectedProduct.features.map((feature) => (
								<li key={feature} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
									{feature}
								</li>
							))}
						</ul>

						{selectedProduct.videos.length > 0 ? (
							<div className="mt-5">
								<h4 className="text-sm font-semibold text-slate-900">{videosLabel}</h4>
								<div className="mt-2 space-y-3">
									{selectedProduct.videos.map((videoUrl) => (
										<video key={videoUrl} src={videoUrl} controls className="w-full rounded-lg border border-slate-200 bg-black/90" />
									))}
								</div>
							</div>
						) : null}
					</div>
				</div>
			) : null}
		</div>
	);
}
