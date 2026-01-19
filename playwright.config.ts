import { defineConfig } from '@playwright/test';

export default defineConfig({
	// Give failing tests 3 retry attempts
	retries: 3
});
