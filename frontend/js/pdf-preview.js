/**
 * PDF Preview Component
 * Safely displays PDFs via blob URLs instead of file:// protocol
 */

const PdfPreview = {
  /**
   * Open PDF preview in a modal
   * @param {number} userId - User ID to preview PDF for
   * @param {string} title - Title for the modal
   */
  async openPreview(userId, title = 'Digital Will Preview') {
    try {
      // Check for both user and executor tokens
      let token = localStorage.getItem('token') || 
                  sessionStorage.getItem('token') ||
                  localStorage.getItem('executorToken') ||
                  sessionStorage.getItem('executorToken');
      
      if (!token) {
        alert('Authentication required');
        return;
      }

      // Show loading modal
      this.showLoadingModal(title);

      // Fetch PDF from backend - try user endpoint first, then executor endpoint
      let response = await fetch(`https://digipass-3l63.onrender.com/api/will/preview/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // If not found, try executor endpoint
      if (response.status === 404 || response.status === 403) {
        response = await fetch(`https://digipass-3l63.onrender.com/api/executor/will/download/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to load PDF (${response.status})`);
      }

      // Convert response to blob
      const blob = await response.blob();

      // Create blob URL (safe way to load PDF)
      const blobUrl = window.URL.createObjectURL(blob);

      // Update iframe with blob URL
      const iframe = document.getElementById('pdfPreviewIframe');
      if (iframe) {
        iframe.src = blobUrl;
      }

      // Hide loading and show content
      this.hideLoadingModal();
      this.showPreviewModal();

      // Clean up blob URL when modal closes
      const modal = document.getElementById('pdfPreviewModal');
      if (modal) {
        modal.addEventListener('hidden.bs.modal', () => {
          window.URL.revokeObjectURL(blobUrl);
        }, { once: true });
      }

    } catch (error) {
      console.error('Error loading PDF preview:', error);
      this.hideLoadingModal();
      alert(`Error: ${error.message}`);
    }
  },

  /**
   * Download PDF instead of preview
   * @param {number} userId - User ID to download PDF for
   */
  async downloadPdf(userId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      // Fetch PDF from backend
      const response = await fetch(`https://digipass-3l63.onrender.com/api/will/preview/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to download PDF (${response.status})`);
      }

      // Convert to blob and trigger download
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Digital_Will_${userId}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(`Error: ${error.message}`);
    }
  },

  /**
   * Show loading indicator
   */
  showLoadingModal(title) {
    if (!document.getElementById('pdfPreviewModal')) {
      this.createPreviewModal(title);
    }

    const loadingDiv = document.getElementById('pdfPreviewLoading');
    if (loadingDiv) {
      loadingDiv.style.display = 'flex';
    }
  },

  /**
   * Hide loading indicator
   */
  hideLoadingModal() {
    const loadingDiv = document.getElementById('pdfPreviewLoading');
    if (loadingDiv) {
      loadingDiv.style.display = 'none';
    }
  },

  /**
   * Show preview modal
   */
  showPreviewModal() {
    const modal = document.getElementById('pdfPreviewModal');
    if (modal) {
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
    }
  },

  /**
   * Create modal HTML structure
   */
  createPreviewModal(title) {
    // Check if modal already exists
    if (document.getElementById('pdfPreviewModal')) {
      return;
    }

    const modalHtml = `
      <div class="modal fade" id="pdfPreviewModal" tabindex="-1" aria-labelledby="pdfPreviewLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style="max-width: 900px;">
          <div class="modal-content">
            <div class="modal-header" style="background-color: #f7e7ce; border-bottom: 2px solid #102c26;">
              <h5 class="modal-title" id="pdfPreviewLabel" style="color: #102c26; font-weight: 600;">
                ${title}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" style="padding: 0; position: relative; height: 600px;">
              <div id="pdfPreviewLoading" style="display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.9); display: flex; align-items: center; justify-content: center; z-index: 10;">
                <div class="text-center">
                  <div class="spinner-border text-dark mb-3" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p style="color: #102c26; font-weight: 500;">Generating PDF...</p>
                </div>
              </div>
              <iframe 
                id="pdfPreviewIframe" 
                style="width: 100%; height: 100%; border: none;" 
                title="PDF Preview"
                sandbox="allow-same-origin allow-scripts"
              ></iframe>
            </div>
            <div class="modal-footer" style="background-color: #f7e7ce; border-top: 1px solid #ddd;">
              <button type="button" class="btn btn-outline-dark" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-dark" id="pdfDownloadBtn" style="background-color: #102c26; border-color: #102c26;">
                <i class="fas fa-download"></i> Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Insert modal into DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Attach download button handler
    const downloadBtn = document.getElementById('pdfDownloadBtn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const userId = sessionStorage.getItem('digipass_user_id') || localStorage.getItem('userId');
        if (userId) {
          this.downloadPdf(userId);
        }
      });
    }

    // Load Bootstrap modal (if not already loaded)
    if (typeof bootstrap === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
      document.head.appendChild(script);
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PdfPreview;
}
