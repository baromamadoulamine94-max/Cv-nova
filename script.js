// script.js

/**
 * CV Nova - Générateur de CV Intelligent
 * JavaScript Vanilla - Sans dépendances externes (sauf html2pdf)
 */

// ═══════════════════════════════════════
// ÉTAT GLOBAL
// ═══════════════════════════════════════
const state = {
    currentTemplate: 'dark-pro',
    photoData: null,
    skills: [],
    experiences: [],
    educations: [],
    languages: []
};

// ═══════════════════════════════════════
// INITIALISATION
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    initLoading();
    initTypingEffect();
    initNavigation();
    initPhotoUpload();
    initFormListeners();
    initTemplateSelector();
    initProgressBar();
    initDownloadPDF();
    loadFromLocalStorage();
});

// ═══════════════════════════════════════
// LOADING SCREEN
// ═══════════════════════════════════════
function initLoading() {
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 1500);
}

// ═══════════════════════════════════════
// TYPING EFFECT
// ═══════════════════════════════════════
function initTypingEffect() {
    const text = "Crée ton CV professionnel en quelques secondes";
    const element = document.querySelector('.typing-text');
    let index = 0;
    
    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(type, 50 + Math.random() * 50);
        }
    }
    
    setTimeout(type, 800);
}

// ═══════════════════════════════════════
// NAVIGATION & SCROLL
// ═══════════════════════════════════════
function initNavigation() {
    // Bouton Commencer
    document.getElementById('start-btn').addEventListener('click', () => {
        document.getElementById('hero').style.display = 'none';
        document.getElementById('app').classList.remove('hidden');
        document.getElementById('progress-container').classList.add('visible');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        updateProgress();
    });
    
    // Toggle thème clair/sombre
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        themeIcon.className = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('theme', newTheme);
    });
    
    // Restaurer le thème
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeIcon.className = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Bouton Imprimer
    document.getElementById('print-btn').addEventListener('click', () => {
        window.print();
    });
}

// ═══════════════════════════════════════
// UPLOAD PHOTO (Drag & Drop)
// ═══════════════════════════════════════
function initPhotoUpload() {
    const uploadZone = document.getElementById('upload-zone');
    const photoInput = document.getElementById('photoInput');
    const photoPreview = document.getElementById('photo-preview');
    const previewImg = document.getElementById('preview-img');
    const removeBtn = document.getElementById('remove-photo');
    const cvPhotoImg = document.getElementById('cv-photo-img');
    const cvPhotoPlaceholder = document.querySelector('.cv-photo-placeholder');
    
    // Click pour upload
    uploadZone.addEventListener('click', () => photoInput.click());
    
    // Sélection fichier
    photoInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handlePhoto(e.target.files[0]);
        }
    });
    
    // Drag & Drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handlePhoto(e.dataTransfer.files[0]);
        }
    });
    
    // Supprimer photo
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.photoData = null;
        photoPreview.classList.add('hidden');
        uploadZone.classList.remove('hidden');
        photoInput.value = '';
        cvPhotoImg.style.display = 'none';
        cvPhotoImg.src = '';
        cvPhotoPlaceholder.style.display = 'flex';
        saveToLocalStorage();
        updateProgress();
    });
    
    function handlePhoto(file) {
        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image valide.');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            alert('L\'image ne doit pas dépasser 5MB.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            state.photoData = e.target.result;
            previewImg.src = state.photoData;
            photoPreview.classList.remove('hidden');
            uploadZone.classList.add('hidden');
            
            // Mettre à jour le CV
            cvPhotoImg.src = state.photoData;
            cvPhotoImg.style.display = 'block';
            cvPhotoPlaceholder.style.display = 'none';
            
            saveToLocalStorage();
            updateProgress();
        };
        reader.readAsDataURL(file);
    }
}

// ═══════════════════════════════════════
// FORMULAIRE - LISTENERS
// ═══════════════════════════════════════
function initFormListeners() {
    // Champs simples
    const simpleFields = ['fullName', 'email', 'phone', 'address', 'bio', 'portfolio'];
    simpleFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                updateCV();
                updateProgress();
                saveToLocalStorage();
            });
        }
    });
    
    // Compétences initiales
    document.querySelectorAll('.skill-row').forEach(row => {
        initSkillRow(row);
    });
    
    // Expériences initiales
    document.querySelectorAll('.experience-card').forEach(card => {
        initExperienceCard(card);
    });
    
    // Éducation initiale
    document.querySelectorAll('.education-card').forEach(card => {
        initEducationCard(card);
    });
    
    // Langues initiales
    document.querySelectorAll('.language-row').forEach(row => {
        initLanguageRow(row);
    });
}

// ═══════════════════════════════════════
// COMPÉTENCES
// ═══════════════════════════════════════
function addSkill() {
    const container = document.getElementById('skills-container');
    const row = document.createElement('div');
    row.className = 'skill-row';
    row.innerHTML = `
        <input type="text" class="skill-name" placeholder="Compétence (ex: JavaScript)">
        <input type="range" class="skill-level" min="0" max="100" value="80">
        <span class="skill-value">80%</span>
        <button class="btn-remove" onclick="removeSkill(this)"><i class="fas fa-trash"></i></button>
    `;
    container.appendChild(row);
    initSkillRow(row);
    updateCV();
    updateProgress();
    saveToLocalStorage();
}

function removeSkill(btn) {
    btn.closest('.skill-row').remove();
    updateCV();
    updateProgress();
    saveToLocalStorage();
}

function initSkillRow(row) {
    const nameInput = row.querySelector('.skill-name');
    const levelInput = row.querySelector('.skill-level');
    const valueSpan = row.querySelector('.skill-value');
    
    levelInput.addEventListener('input', () => {
        valueSpan.textContent = levelInput.value + '%';
        updateCV();
        saveToLocalStorage();
    });
    
    nameInput.addEventListener('input', () => {
        updateCV();
        saveToLocalStorage();
    });
}

// ═══════════════════════════════════════
// EXPÉRIENCES
// ═══════════════════════════════════════
function addExperience() {
    const container = document.getElementById('experience-container');
    const card = document.createElement('div');
    card.className = 'experience-card';
    card.innerHTML = `
        <div class="input-grid">
            <div class="input-field">
                <label>Poste</label>
                <input type="text" class="exp-title" placeholder="Développeur Full Stack">
            </div>
            <div class="input-field">
                <label>Entreprise</label>
                <input type="text" class="exp-company" placeholder="TechCorp">
            </div>
            <div class="input-field">
                <label>Date</label>
                <input type="text" class="exp-date" placeholder="2022 - Présent">
            </div>
        </div>
        <div class="input-field">
            <label>Description</label>
            <textarea class="exp-desc" rows="3" placeholder="Décrivez vos missions et réalisations..."></textarea>
        </div>
        <button class="btn-remove-card" onclick="removeExperience(this)">
            <i class="fas fa-trash"></i> Supprimer
        </button>
    `;
    container.appendChild(card);
    initExperienceCard(card);
    updateCV();
    updateProgress();
    saveToLocalStorage();
}

function removeExperience(btn) {
    btn.closest('.experience-card').remove();
    updateCV();
    updateProgress();
    saveToLocalStorage();
}

function initExperienceCard(card) {
    card.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
            updateCV();
            saveToLocalStorage();
        });
    });
}

// ═══════════════════════════════════════
// ÉDUCATION
// ═══════════════════════════════════════
function addEducation() {
    const container = document.getElementById('education-container');
    const card = document.createElement('div');
    card.className = 'education-card';
    card.innerHTML = `
        <div class="input-grid">
            <div class="input-field">
                <label>Diplôme</label>
                <input type="text" class="edu-degree" placeholder="Master Informatique">
            </div>
            <div class="input-field">
                <label>École</label>
                <input type="text" class="edu-school" placeholder="Université de Paris">
            </div>
            <div class="input-field">
                <label>Année</label>
                <input type="text" class="edu-year" placeholder="2020 - 2022">
            </div>
        </div>
        <button class="btn-remove-card" onclick="removeEducation(this)">
            <i class="fas fa-trash"></i> Supprimer
        </button>
    `;
    container.appendChild(card);
    initEducationCard(card);
    updateCV();
    updateProgress();
    saveToLocalStorage();
}

function removeEducation(btn) {
    btn.closest('.education-card').remove();
    updateCV();
    updateProgress();
    saveToLocalStorage();
}

function initEducationCard(card) {
    card.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            updateCV();
            saveToLocalStorage();
        });
    });
}

// ═══════════════════════════════════════
// LANGUES
// ═══════════════════════════════════════
function addLanguage() {
    const container = document.getElementById('languages-container');
    const row = document.createElement('div');
    row.className = 'language-row';
    row.innerHTML = `
        <input type="text" class="lang-name" placeholder="Français">
        <select class="lang-level">
            <option value="Natif">Natif</option>
            <option value="Courant">Courant</option>
            <option value="Avancé">Avancé</option>
            <option value="Intermédiaire">Intermédiaire</option>
            <option value="Débutant">Débutant</option>
        </select>
        <button class="btn-remove" onclick="removeLanguage(this)"><i class="fas fa-trash"></i></button>
    `;
    container.appendChild(row);
    initLanguageRow(row);
    updateCV();
    updateProgress();
    saveToLocalStorage();
}

function removeLanguage(btn) {
    btn.closest('.language-row').remove();
    updateCV();
    updateProgress();
    saveToLocalStorage();
}

function initLanguageRow(row) {
    row.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', () => {
            updateCV();
            saveToLocalStorage();
        });
    });
}

// ═══════════════════════════════════════
// MISE À JOUR DU CV
// ═══════════════════════════════════════
function updateCV() {
    // Informations personnelles
    const fullName = document.getElementById('fullName').value || 'Votre Nom';
    const email = document.getElementById('email').value || 'email@exemple.com';
    const phone = document.getElementById('phone').value || '+33 6 12 34 56 78';
    const address = document.getElementById('address').value || 'Ville, Pays';
    const portfolio = document.getElementById('portfolio').value;
    const bio = document.getElementById('bio').value;
    
    document.getElementById('cv-name').textContent = fullName;
    document.getElementById('cv-email').innerHTML = `<i class="fas fa-envelope"></i> ${email}`;
    document.getElementById('cv-phone').innerHTML = `<i class="fas fa-phone"></i> ${phone}`;
    document.getElementById('cv-address').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${address}`;
    
    // Portfolio
    const cvPortfolio = document.getElementById('cv-portfolio');
    if (portfolio) {
        cvPortfolio.style.display = 'inline-flex';
        cvPortfolio.innerHTML = `<i class="fas fa-globe"></i> <a href="${portfolio}" target="_blank">${portfolio.replace(/^https?:\/\//, '')}</a>`;
    } else {
        cvPortfolio.style.display = 'none';
    }
    
    // Bio
    const cvBioSection = document.getElementById('cv-bio-section');
    const cvBio = document.getElementById('cv-bio');
    if (bio) {
        cvBioSection.style.display = 'block';
        cvBio.textContent = bio;
    } else {
        cvBioSection.style.display = 'none';
    }
    
    // Compétences
    updateSkills();
    
    // Expériences
    updateExperiences();
    
    // Éducation
    updateEducations();
    
    // Langues
    updateLanguages();
}

function updateSkills() {
    const container = document.getElementById('cv-skills');
    const section = document.getElementById('cv-skills-section');
    const rows = document.querySelectorAll('.skill-row');
    
    if (rows.length === 0 || !rows[0].querySelector('.skill-name').value) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    container.innerHTML = '';
    
    rows.forEach(row => {
        const name = row.querySelector('.skill-name').value;
        const level = row.querySelector('.skill-level').value;
        
        if (!name) return;
        
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        skillItem.innerHTML = `
            <div class="skill-item-name">${name}</div>
            <div class="skill-bar-bg">
                <div class="skill-bar-fill" style="width: 0%"></div>
            </div>
        `;
        container.appendChild(skillItem);
        
        // Animation de la barre
        setTimeout(() => {
            skillItem.querySelector('.skill-bar-fill').style.width = level + '%';
        }, 100);
    });
}

function updateExperiences() {
    const container = document.getElementById('cv-experiences');
    const section = document.getElementById('cv-experience-section');
    const cards = document.querySelectorAll('.experience-card');
    
    const validCards = Array.from(cards).filter(card => 
        card.querySelector('.exp-title').value || 
        card.querySelector('.exp-company').value
    );
    
    if (validCards.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    container.innerHTML = '';
    
    validCards.forEach(card => {
        const title = card.querySelector('.exp-title').value || 'Poste';
        const company = card.querySelector('.exp-company').value || 'Entreprise';
        const date = card.querySelector('.exp-date').value || '';
        const desc = card.querySelector('.exp-desc').value || '';
        
        const item = document.createElement('div');
        item.className = 'cv-item';
        item.innerHTML = `
            <div class="cv-item-header">
                <div>
                    <div class="cv-item-title">${title}</div>
                    <div class="cv-item-subtitle">${company}</div>
                </div>
                ${date ? `<div class="cv-item-date">${date}</div>` : ''}
            </div>
            ${desc ? `<div class="cv-item-desc">${desc}</div>` : ''}
        `;
        container.appendChild(item);
    });
}

function updateEducations() {
    const container = document.getElementById('cv-educations');
    const section = document.getElementById('cv-education-section');
    const cards = document.querySelectorAll('.education-card');
    
    const validCards = Array.from(cards).filter(card => 
        card.querySelector('.edu-degree').value || 
        card.querySelector('.edu-school').value
    );
    
    if (validCards.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    container.innerHTML = '';
    
    validCards.forEach(card => {
        const degree = card.querySelector('.edu-degree').value || 'Diplôme';
        const school = card.querySelector('.edu-school').value || 'École';
        const year = card.querySelector('.edu-year').value || '';
        
        const item = document.createElement('div');
        item.className = 'cv-item';
        item.innerHTML = `
            <div class="cv-item-header">
                <div>
                    <div class="cv-item-title">${degree}</div>
                    <div class="cv-item-subtitle">${school}</div>
                </div>
                ${year ? `<div class="cv-item-date">${year}</div>` : ''}
            </div>
        `;
        container.appendChild(item);
    });
}

function updateLanguages() {
    const container = document.getElementById('cv-languages');
    const section = document.getElementById('cv-languages-section');
    const rows = document.querySelectorAll('.language-row');
    
    const validRows = Array.from(rows).filter(row => row.querySelector('.lang-name').value);
    
    if (validRows.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    container.innerHTML = '';
    
    validRows.forEach(row => {
        const name = row.querySelector('.lang-name').value;
        const level = row.querySelector('.lang-level').value;
        
        const tag = document.createElement('div');
        tag.className = 'lang-tag';
        tag.innerHTML = `
            <span class="lang-tag-name">${name}</span>
            <span class="lang-tag-level">${level}</span>
        `;
        container.appendChild(tag);
    });
}

// ═══════════════════════════════════════
// SÉLECTEUR DE TEMPLATE
// ═══════════════════════════════════════
function initTemplateSelector() {
    const buttons = document.querySelectorAll('.template-btn');
    const preview = document.getElementById('cv-preview');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Retirer active de tous
            buttons.forEach(b => b.classL
