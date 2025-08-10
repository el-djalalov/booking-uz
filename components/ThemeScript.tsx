/* // components/theme-script.tsx
export function ThemeScript() {
	const script = `
    (function() {
      const theme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.style.colorScheme = theme;
    })();
  `;

	return (
		<script
			dangerouslySetInnerHTML={{ __html: script }}
			suppressHydrationWarning
		/>
	);
}
 */
