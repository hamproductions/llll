import { relations } from "drizzle-orm/relations";
import { bundle, bundleCategory, bundleContent, bundleDependency } from "./schema";

export const bundleCategoryRelations = relations(bundleCategory, ({one}) => ({
	bundle: one(bundle, {
		fields: [bundleCategory.uid],
		references: [bundle.uid]
	}),
}));

export const bundleRelations = relations(bundle, ({many}) => ({
	bundleCategories: many(bundleCategory),
	bundleContents: many(bundleContent),
	bundleDependencies: many(bundleDependency),
}));

export const bundleContentRelations = relations(bundleContent, ({one}) => ({
	bundle: one(bundle, {
		fields: [bundleContent.uid],
		references: [bundle.uid]
	}),
}));

export const bundleDependencyRelations = relations(bundleDependency, ({one}) => ({
	bundle: one(bundle, {
		fields: [bundleDependency.uid],
		references: [bundle.uid]
	}),
}));