import type { MetadataRoute } from "next";

const BASE_URL = "https://sentinel.security";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: BASE_URL,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: `${BASE_URL}/proposals`,
			lastModified: new Date(),
			changeFrequency: "hourly",
			priority: 0.9,
		},
		{
			url: `${BASE_URL}/multisigs`,
			lastModified: new Date(),
			changeFrequency: "hourly",
			priority: 0.9,
		},
		{
			url: `${BASE_URL}/analyze`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.8,
		},
		{
			url: `${BASE_URL}/scanner`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.8,
		},
	];
}
