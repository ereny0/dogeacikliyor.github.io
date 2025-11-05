// Video Koleksiyonu JavaScript
class VideoCollection {
    constructor() {
        this.videos = this.loadVideos();
        this.filteredVideos = [...this.videos];
        this.allTags = new Set();
        
        this.initializeElements();
        this.bindEvents();
        this.updateTagsFromVideos();
        this.renderVideos();
        this.renderSearchTags();
        
        // Debug: Console'da tag durumunu kontrol et
        console.log('Yüklenen videolar:', this.videos);
        console.log('Tüm taglar:', Array.from(this.allTags));
    }

    initializeElements() {
        // Buttons
        this.addVideoBtn = document.getElementById('addVideoBtn');
        this.closeModal = document.getElementById('closeModal');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.closeDetailModal = document.getElementById('closeDetailModal');
        this.searchBtn = document.getElementById('searchBtn');

        // Modals
        this.addVideoModal = document.getElementById('addVideoModal');
        this.videoDetailModal = document.getElementById('videoDetailModal');

        // Form
        this.addVideoForm = document.getElementById('addVideoForm');
        this.searchInput = document.getElementById('searchInput');

        // Display areas
        this.videoGrid = document.getElementById('videoGrid');
        this.searchTags = document.getElementById('searchTags');
    }

    bindEvents() {
        // Modal controls
        this.addVideoBtn.addEventListener('click', () => this.openAddModal());
        this.closeModal.addEventListener('click', () => this.closeAddModal());
        this.cancelBtn.addEventListener('click', () => this.closeAddModal());
        this.closeDetailModal.addEventListener('click', () => this.closeDetailModal());

        // Form submission
        this.addVideoForm.addEventListener('submit', (e) => this.handleAddVideo(e));

        // Search
        this.searchBtn.addEventListener('click', () => this.performSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        this.searchInput.addEventListener('input', () => this.performSearch());

        // Close modal on outside click
        this.addVideoModal.addEventListener('click', (e) => {
            if (e.target === this.addVideoModal) this.closeAddModal();
        });
        this.videoDetailModal.addEventListener('click', (e) => {
            if (e.target === this.videoDetailModal) this.closeDetailModal();
        });

        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!this.addVideoModal.classList.contains('hidden')) {
                    this.closeAddModal();
                }
                if (!this.videoDetailModal.classList.contains('hidden')) {
                    this.closeDetailModal();
                }
            }
        });
    }

    // Local Storage Operations
    loadVideos() {
        const stored = localStorage.getItem('videoCollection');
        return stored ? JSON.parse(stored) : [];
    }

    saveVideos() {
        localStorage.setItem('videoCollection', JSON.stringify(this.videos));
    }

    // Modal Operations
    openAddModal() {
        this.addVideoModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeAddModal() {
        this.addVideoModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.addVideoForm.reset();
    }

    closeDetailModal() {
        this.videoDetailModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    // Video Operations
    handleAddVideo(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const videoData = {
            id: Date.now().toString(),
            title: document.getElementById('videoTitle').value.trim(),
            url: document.getElementById('videoUrl').value.trim(),
            cover: document.getElementById('videoCover').value.trim(),
            tags: document.getElementById('videoTags').value
                .split(',')
                .map(tag => tag.trim().toLowerCase())
                .filter(tag => tag.length > 0),
            description: document.getElementById('videoDescription').value.trim(),
            createdAt: new Date().toISOString()
        };

        // Validation
        if (!videoData.title || !videoData.url) {
            alert('Başlık ve video linki zorunludur!');
            return;
        }

        // Add video
        this.videos.unshift(videoData);
        this.saveVideos();
        this.updateTagsFromVideos();
        this.renderVideos();
        this.renderSearchTags();
        this.closeAddModal();

        // Show success message
        this.showNotification('Video başarıyla eklendi!', 'success');
    }

    deleteVideo(videoId) {
        if (confirm('Bu videoyu silmek istediğinizden emin misiniz?')) {
            this.videos = this.videos.filter(video => video.id !== videoId);
            this.saveVideos();
            this.updateTagsFromVideos();
            this.renderVideos();
            this.renderSearchTags();
            this.closeDetailModal();
            this.showNotification('Video silindi!', 'success');
        }
    }

    // Search Operations
    performSearch() {
        const query = this.searchInput.value.toLowerCase().trim();
        
        if (!query) {
            this.filteredVideos = [...this.videos];
        } else {
            this.filteredVideos = this.videos.filter(video => {
                return video.title.toLowerCase().includes(query) ||
                       video.description.toLowerCase().includes(query) ||
                       video.tags.some(tag => tag.includes(query));
            });
        }
        
        this.renderVideos();
    }

    filterByTag(tag) {
        const activeTag = document.querySelector('.tag.active');
        if (activeTag) {
            activeTag.classList.remove('active');
        }

        const clickedTag = event.target;
        
        if (clickedTag.classList.contains('active')) {
            // If already active, show all videos
            this.filteredVideos = [...this.videos];
            this.searchInput.value = '';
        } else {
            // Filter by tag
            clickedTag.classList.add('active');
            this.filteredVideos = this.videos.filter(video => 
                video.tags.includes(tag)
            );
            this.searchInput.value = tag;
        }
        
        this.renderVideos();
    }

    // Rendering Operations
    updateTagsFromVideos() {
        this.allTags.clear();
        this.videos.forEach(video => {
            video.tags.forEach(tag => this.allTags.add(tag));
        });
    }

    renderSearchTags() {
        if (this.allTags.size === 0) {
            this.searchTags.innerHTML = '';
            return;
        }

        const tagsArray = Array.from(this.allTags).sort();
        this.searchTags.innerHTML = tagsArray
            .map(tag => `<span class="tag" onclick="app.filterByTag('${tag}')">${tag}</span>`)
            .join('');
    }

    renderVideos() {
        if (this.filteredVideos.length === 0) {
            if (this.videos.length === 0) {
                this.videoGrid.innerHTML = `
                    <div class="empty-state">
                        <p>Henüz video eklenmemiş. İlk videoyu eklemek için "Video Ekle" butonuna tıklayın.</p>
                    </div>
                `;
            } else {
                this.videoGrid.innerHTML = `
                    <div class="empty-state">
                        <p>Arama kriterlerinize uygun video bulunamadı.</p>
                    </div>
                `;
            }
            return;
        }

        this.videoGrid.innerHTML = this.filteredVideos
            .map(video => this.createVideoCard(video))
            .join('');
    }

    createVideoCard(video) {
        const coverImage = video.cover || 'https://via.placeholder.com/300x200/1a1a1a/ff2d2d?text=Video';
        const description = video.description || 'Açıklama bulunmuyor.';
        const truncatedDescription = description.length > 100 
            ? description.substring(0, 100) + '...' 
            : description;

        return `
            <div class="video-card" onclick="app.showVideoDetail('${video.id}')">
                <img src="${coverImage}" alt="${video.title}" class="video-cover" 
                     onerror="this.src='https://via.placeholder.com/300x200/1a1a1a/ff2d2d?text=Video'">
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <p class="video-description">${truncatedDescription}</p>
                    <div class="video-tags">
                        ${video.tags.map(tag => `<span class="video-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    showVideoDetail(videoId) {
        const video = this.videos.find(v => v.id === videoId);
        if (!video) return;

        const coverImage = video.cover || 'https://via.placeholder.com/400x250/1a1a1a/ff2d2d?text=Video';
        const description = video.description || 'Açıklama bulunmuyor.';

        document.getElementById('detailTitle').textContent = video.title;
        document.getElementById('detailCover').src = coverImage;
        document.getElementById('detailDescription').textContent = description;
        document.getElementById('detailTags').innerHTML = video.tags
            .map(tag => `<span class="tag">${tag}</span>`)
            .join('');
        document.getElementById('detailLink').href = video.url;

        // Add delete button
        const modalContent = document.querySelector('#videoDetailModal .video-detail');
        const existingDeleteBtn = modalContent.querySelector('.delete-btn');
        if (existingDeleteBtn) {
            existingDeleteBtn.remove();
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-secondary delete-btn';
        deleteBtn.textContent = 'Videoyu Sil';
        deleteBtn.style.marginTop = '15px';
        deleteBtn.onclick = () => this.deleteVideo(videoId);
        modalContent.appendChild(deleteBtn);

        this.videoDetailModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Utility
    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#ff2d2d' : '#333'};
            color: white;
            padding: 15px 20px;
            border-radius: 6px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new VideoCollection();
});