/**
 * Clipboard utility functions
 */

/**
 * Copies text to the system clipboard using the Clipboard API
 *
 * @param text - The text to copy to clipboard
 * @throws Error if clipboard API is not available or operation fails
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (!navigator.clipboard) {
    throw new Error('Clipboard API not available in this browser');
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to copy to clipboard');
  }
}
