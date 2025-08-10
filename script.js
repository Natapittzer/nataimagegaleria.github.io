class ImageGallery {
    constructor() {
        this.images = [];
        this.init();
    }

    init() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.gallery = document.getElementById('gallery');
        this.emptyState = document.getElementById('emptyState');
        
        this.setupEventListeners();
        this.loadImagesFromStorage();
        this.updateEmptyState();
    }

    setupEventListeners() {
        // Upload por clique
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        // Upload por seleção de arquivo
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files);
        });
    }

    handleFileSelect(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                this.addImage(file);
            }
        });
    }

    addImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = {
                id: Date.now() + Math.random(),
                src: e.target.result,
                name: file.name,
                size: this.formatFileSize(file.size),
                caption: '',
                date: new Date().toLocaleDateString('pt-BR')
            };

            this.images.push(imageData);
            this.renderImage(imageData);
            this.saveImagesToStorage();
            this.updateEmptyState();
        };
        reader.readAsDataURL(file);
    }

    renderImage(imageData) {
        const imageCard = document.createElement('div');
        imageCard.className = 'image-card';
        imageCard.dataset.id = imageData.id;

        imageCard.innerHTML = `
            <div class="image-container">
                <img src="${imageData.src}" alt="${imageData.name}" onclick="gallery.openImageModal('${imageData.src}', '${imageData.name}', '${imageData.caption}')" style="cursor: pointer;">

    
                <div class="image-actions">
                    <button class="action-btn" onclick="gallery.deleteImage('${imageData.id}')" title="Excluir imagem">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="image-info">
                <textarea 
                    class="caption-input" 
                    placeholder="Escreva uma legenda para esta imagem..."
                    onchange="gallery.updateCaption('${imageData.id}', this.value)"
                >${imageData.caption}</textarea>
                <div class="image-meta">
                    <span class="image-size">${imageData.size}</span>
                    <span>${imageData.date}</span>
                </div>
            </div>
        `;

        this.gallery.appendChild(imageCard);
    }

    updateCaption(imageId, caption) {
        const image = this.images.find(img => img.id == imageId);
        if (image) {
            image.caption = caption;
            this.saveImagesToStorage();
        }
    }

    deleteImage(imageId) {
        const imageIndex = this.images.findIndex(img => img.id == imageId);
        if (imageIndex > -1) {
            this.images.splice(imageIndex, 1);
            this.saveImagesToStorage();
            this.updateEmptyState();
        }

        const imageCard = document.querySelector(`[data-id="${imageId}"]`);
        if (imageCard) {
            imageCard.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                imageCard.remove();
            }, 300);
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    saveImagesToStorage() {
        try {
            localStorage.setItem('galleryImages', JSON.stringify(this.images));
        } catch (e) {
            console.warn('Não foi possível salvar as imagens no localStorage:', e);
        }
    }

    loadImagesFromStorage() {
        try {
            const savedImages = localStorage.getItem('galleryImages');
            if (savedImages) {
                this.images = JSON.parse(savedImages);
                this.images.forEach(imageData => {
                    this.renderImage(imageData);
                });
            }
        } catch (e) {
            console.warn('Não foi possível carregar as imagens do localStorage:', e);
        }
    }

    updateEmptyState() {
        if (this.images.length === 0) {
            this.emptyState.style.display = 'block';
            this.gallery.style.display = 'none';
        } else {
            this.emptyState.style.display = 'none';
            this.gallery.style.display = 'grid';
        }
    }

    openImageModal(imageSrc, imageName, imageCaption) {
        // Criar o modal
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="gallery.closeImageModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${imageName}</h3>
                    <button class="modal-close" onclick="gallery.closeImageModal()">✕</button>
                </div>
                <div class="modal-image-container">
                    <img src="${imageSrc}" alt="${imageName}" class="modal-image">
                </div>
                ${imageCaption ? `<div class="modal-caption">${imageCaption}</div>` : ''}
            </div>
        `;

        document.body.appendChild(modal);
        
        // Adicionar classe para animação
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeImageModal();
            }
        });
    }

    closeImageModal() {
        const modal = document.querySelector('.image-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }
}

// Adicionar animação de fadeOut
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.8);
        }
    }
`;
document.head.appendChild(style);

// Inicializar a galeria quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.gallery = new ImageGallery();
});

// Adicionar funcionalidade de teclas de atalho
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        // Ctrl+Z para desfazer última exclusão (se implementado)
        e.preventDefault();
    }
});

// Melhorar a experiência do usuário com feedback visual
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : '#2196f3'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Adicionar animações para notificações
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyle);
