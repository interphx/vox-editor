/**
 * Shows a file saving dialog.
 * @param content Content of the file
 * @param filename Name of the file
 */
export function downloadAsFile(content: string, filename: string): void {
    const dataString = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
    const element = document.createElement('a');
    element.setAttribute('href', dataString);
    element.setAttribute('download', filename);
    element.style.opacity = '0';
    element.style.position = 'fixed';
    element.style.bottom = '-999px';
    element.style.right = '-999px';
    document.body.appendChild(element);
    element.click();
    element.remove();
}

/**
 * Shows a file selection dialog and reads the content of the selected file as a string.
 * @returns Text content of the file
 */
export function readUploadedFileAsString(): Promise<string> {
    return new Promise((resolve, reject) => {
        const fileInput = document.createElement('input');
        fileInput.setAttribute('type', 'file');
        fileInput.style.opacity = '0';
        fileInput.style.position = 'fixed';
        fileInput.style.bottom = '-999px';
        fileInput.style.right = '-999px';
        fileInput.style.zIndex = '-999';
        document.body.appendChild(fileInput);
        fileInput.addEventListener('change', event => {
            event.stopPropagation();
            if (!fileInput.files || !fileInput.files.length || !fileInput.files[0]) {
                reject('No file selected');
                return;
            }
            const file = fileInput.files[0];
            const fileReader = new FileReader();
            fileReader.onload = event => {
                const uploadedData = event.target?.result || null;
                if (typeof uploadedData !== 'string' && uploadedData) {
                    reject(`Expected a string upload result, got ${typeof uploadedData}`);
                    console.warn(`Expected a string upload result, got ${typeof uploadedData}`);
                    return;
                }
                if (uploadedData == null) {
                    reject('Failed to upload any data');
                    return;
                }
                resolve(uploadedData);
            };
            fileReader.onerror = event => {
                reject(event?.target?.error);
            };
            fileReader.onabort = () => {
                reject('aborted');
            };
            fileReader.readAsText(file);
        });
        fileInput.click();
        setTimeout(() => {
            fileInput.parentNode!.removeChild(fileInput);
        }, 100);
    });
}
