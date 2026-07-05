/**
 * Agentic AI Email Reply Generator
 * Frontend Script
 */

// Preset Email Templates
const presets = {
    interview: `Subject: Interview Invitation: Senior AI Engineer position at InnovateTech

Dear Candidate,

Thank you for your application for the Senior AI Engineer role at InnovateTech. We were highly impressed by your resume and background in full-stack AI development.

We would love to invite you for a 45-minute technical interview with our Lead Architect. The interview will cover your experiences with LLMs, Agentic Workflows, and full-stack integration.

Please let us know your availability over the next three business days (Tuesday to Thursday, 9 AM - 5 PM EST).

Best regards,
Sarah Jenkins
Technical Talent Acquisition
InnovateTech Group`,

    complaint: `Subject: Urgent: Broken Product & Unresponsive Customer Service! (Order #82941)

To Whom It May Concern,

I am writing this email because I am absolutely furious. I ordered your premium SmartHub device last week, and it arrived yesterday completely dead on arrival. It won't power on, no matter what outlet or cable I use.

Even worse, I tried calling your support line twice and was put on hold for over 30 minutes each time before being disconnected.

This was supposed to be a birthday gift for my son, and now his birthday is ruined. I expect a full refund or an overnight replacement shipped immediately, along with an explanation for this terrible service.

Sincerely,
Mark Henderson
Disappointed Customer`,

    meeting: `Subject: Project Sync & Q3 Timeline Review

Hi Team,

I hope you're all having a productive week. 

As we approach the mid-way point of the quarter, I'd like to schedule a 30-minute sync to review our Q3 deliverables and make sure we are aligned on the upcoming beta release.

Could you please fill out your availability on the shared team calendar by tomorrow morning? I will send out a Google Meet invite once we have a consensus on the time slot.

Thanks,
Alex Rivera
Project Delivery Lead`,

    payment: `Subject: Friendly Reminder: Overdue Payment for Invoice #INV-2026-042

Dear Billing Team,

I hope this email finds you well.

This is a gentle reminder that payment for invoice #INV-2026-042, which was sent on June 4, 2026, is now overdue. The outstanding balance is $4,850.00.

Please review the attached invoice and let us know if you have any questions or require any additional billing details. We would appreciate it if you could process this payment at your earliest convenience.

Thank you for your prompt attention to this matter.

Warm regards,
Accounting Department
Apex Solutions Ltd.`
};

// UI Elements
const emailInput = document.getElementById('email-input');
const replyStyle = document.getElementById('reply-style');
const sampleEmails = document.getElementById('sample-emails');
const clearBtn = document.getElementById('clear-btn');
const analyzeBtn = document.getElementById('analyze-btn');
const replyBtn = document.getElementById('reply-btn');
const errorCard = document.getElementById('error-card');
const errorText = document.getElementById('error-text');

// State Cards
const loadingState = document.getElementById('loading-state');
const loadingTitle = document.getElementById('loading-title');
const loadingDesc = document.getElementById('loading-desc');
const analysisCard = document.getElementById('analysis-card');
const replyCard = document.getElementById('reply-card');

// Output fields
const outIntent = document.getElementById('out-intent');
const outPriority = document.getElementById('out-priority');
const outTone = document.getElementById('out-tone');
const outSummary = document.getElementById('out-summary');
const outReply = document.getElementById('out-reply');
const priorityDot = document.getElementById('priority-dot');
const toneIconContainer = document.getElementById('tone-icon-container');

// Toast Notification
const toast = document.getElementById('toast');
const toastText = document.getElementById('toast-text');

// Initialize Lucide Icons on Load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// Event Listeners
sampleEmails.addEventListener('change', (e) => {
    const key = e.target.value;
    if (presets[key]) {
        emailInput.value = presets[key];
        hideError();
    }
});

clearBtn.addEventListener('clear-btn', () => {
    emailInput.value = '';
    sampleEmails.selectedIndex = 0;
    hideError();
    analysisCard.classList.add('hidden');
    replyCard.classList.add('hidden');
});

// Real Clear Button function mapping
clearBtn.onclick = () => {
    emailInput.value = '';
    sampleEmails.selectedIndex = 0;
    hideError();
    analysisCard.classList.add('hidden');
    replyCard.classList.add('hidden');
};

analyzeBtn.addEventListener('click', analyzeEmail);
replyBtn.addEventListener('click', generateReply);
document.getElementById('copy-btn').addEventListener('click', copyReply);

// Functions

/**
 * Show error message panel
 */
function showError(message) {
    errorText.textContent = message;
    errorCard.classList.remove('hidden');
    errorCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Hide error message panel
 */
function hideError() {
    errorCard.classList.add('hidden');
}

/**
 * Show loading screen with specific text
 */
function showLoading(title, desc) {
    loadingTitle.textContent = title;
    loadingDesc.textContent = desc;
    loadingState.classList.remove('hidden');
    
    // Disable inputs
    emailInput.disabled = true;
    replyStyle.disabled = true;
    sampleEmails.disabled = true;
    analyzeBtn.disabled = true;
    replyBtn.disabled = true;
    
    analyzeBtn.classList.add('opacity-50', 'cursor-not-allowed');
    replyBtn.classList.add('opacity-50', 'cursor-not-allowed');
}

/**
 * Hide loading screen
 */
function hideLoading() {
    loadingState.classList.add('hidden');
    
    // Re-enable inputs
    emailInput.disabled = false;
    replyStyle.disabled = false;
    sampleEmails.disabled = false;
    analyzeBtn.disabled = false;
    replyBtn.disabled = false;
    
    analyzeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    replyBtn.classList.remove('opacity-50', 'cursor-not-allowed');
}

/**
 * Agent 1: Analyze Email Intent & Metadata
 */
async function analyzeEmail() {
    const email = emailInput.value.trim();
    if (!email) {
        showError('Please paste an email first before attempting analysis.');
        return;
    }
    
    hideError();
    showLoading(
        'Agent 1: Scanning Email', 
        'Parsing semantic syntax, detecting conversation intent, priority indicators, and sentiment tone...'
    );
    
    analysisCard.classList.add('hidden');
    
    try {
        const response = await fetch('http://127.0.0.1:8000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'Server responded with an error.');
        }
        
        const data = await response.json();
        
        // Populate fields
        outIntent.textContent = data.intent || 'Information Request';
        outPriority.textContent = data.priority || 'Medium';
        outTone.textContent = data.tone || 'Neutral';
        outSummary.textContent = data.summary || 'No summary available.';
        
        // Tone Icon mapping
        let iconName = 'smile';
        const toneLower = (data.tone || '').toLowerCase();
        if (toneLower.includes('angry')) iconName = 'angry';
        else if (toneLower.includes('urgent')) iconName = 'alert-circle';
        else if (toneLower.includes('happy')) iconName = 'laugh';
        else if (toneLower.includes('neutral')) iconName = 'meh';
        else if (toneLower.includes('friendly')) iconName = 'smile';
        else iconName = 'briefcase';
        
        toneIconContainer.innerHTML = `<i data-lucide="${iconName}" class="w-5 h-5 text-indigo-400"></i>`;
        
        // Priority dot style
        const priorityLower = (data.priority || '').toLowerCase();
        priorityDot.className = 'absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full';
        if (priorityLower.includes('high')) {
            priorityDot.classList.add('bg-rose-500', 'shadow-rose-500/80', 'shadow-[0_0_8px_rgba(244,63,94,0.8)]');
        } else if (priorityLower.includes('medium')) {
            priorityDot.classList.add('bg-amber-500', 'shadow-amber-500/80', 'shadow-[0_0_8px_rgba(245,158,11,0.8)]');
        } else {
            priorityDot.classList.add('bg-emerald-500', 'shadow-emerald-500/80', 'shadow-[0_0_8px_rgba(16,185,129,0.8)]');
        }
        
        // Re-run Lucide on new dynamic elements
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        hideLoading();
        analysisCard.classList.remove('hidden');
        analysisCard.classList.add('animate-fadeIn');
        
    } catch (error) {
        console.error('Analysis API Error:', error);
        hideLoading();
        showError(`Analysis failed: ${error.message}`);
    }
}

/**
 * Agent 2: Generate Reply based on original email + style
 */
async function generateReply() {
    const email = emailInput.value.trim();
    if (!email) {
        showError('Please paste an email first before attempting reply generation.');
        return;
    }
    
    const style = replyStyle.value;
    hideError();
    
    showLoading(
        'Agent 2: Drafting Response', 
        `Configuring tone parameters to match "${style}" style, ingesting intent metrics, and drafting professional copy...`
    );
    
    replyCard.classList.add('hidden');
    
    try {
        const response = await fetch('http://127.0.0.1:8000/reply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, style })
        });
        
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'Server responded with an error.');
        }
        
        const data = await response.json();
        
        // Populate response field
        outReply.textContent = data.reply || '';
        
        // Also run analysis in parallel (if not already completed) so the metadata panel looks complete
        if (analysisCard.classList.contains('hidden')) {
            // Silently run analysis to fill in the left panel for the user context
            fetch('http://127.0.0.1:8000/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            }).then(res => res.json()).then(data => {
                outIntent.textContent = data.intent || 'Information Request';
                outPriority.textContent = data.priority || 'Medium';
                outTone.textContent = data.tone || 'Neutral';
                outSummary.textContent = data.summary || 'No summary available.';
                
                // Dot style update
                const priorityLower = (data.priority || '').toLowerCase();
                priorityDot.className = 'absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full';
                if (priorityLower.includes('high')) {
                    priorityDot.classList.add('bg-rose-500', 'shadow-[0_0_8px_rgba(244,63,94,0.8)]');
                } else if (priorityLower.includes('medium')) {
                    priorityDot.classList.add('bg-amber-500', 'shadow-[0_0_8px_rgba(245,158,11,0.8)]');
                } else {
                    priorityDot.classList.add('bg-emerald-500', 'shadow-[0_0_8px_rgba(16,185,129,0.8)]');
                }
                
                analysisCard.classList.remove('hidden');
                analysisCard.classList.add('animate-fadeIn');
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }).catch(err => console.log('Silent analysis catch:', err));
        }
        
        hideLoading();
        replyCard.classList.remove('hidden');
        replyCard.classList.add('animate-fadeIn');
        
    } catch (error) {
        console.error('Reply API Error:', error);
        hideLoading();
        showError(`Drafting failed: ${error.message}`);
    }
}

/**
 * Copy generated reply to clipboard
 */
function copyReply() {
    const text = outReply.textContent || outReply.innerText;
    if (!text || text.trim() === '') {
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'check-circle', 'text-emerald-400', 'border-emerald-500/30');
    }).catch(err => {
        console.error('Clipboard copy error:', err);
        // Fallback selection copy
        const range = document.createRange();
        range.selectNode(outReply);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        try {
            document.execCommand('copy');
            showToast('Copied to clipboard!', 'check-circle', 'text-emerald-400', 'border-emerald-500/30');
        } catch (e) {
            showToast('Failed to copy. Try manual copy.', 'alert-triangle', 'text-rose-400', 'border-rose-500/30');
        }
        window.getSelection().removeAllRanges();
    });
}

/**
 * Show absolute Toast notification
 */
function showToast(message, icon, textClass, borderClass) {
    toastText.textContent = message;
    toast.className = `fixed bottom-5 right-5 z-50 transform transition-all duration-300 bg-slate-900/90 backdrop-blur-md border px-4 py-3 rounded-xl shadow-glass flex items-center gap-2 ${borderClass} ${textClass}`;
    
    // Animate in
    toast.classList.remove('translate-y-12', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    
    setTimeout(() => {
        // Animate out
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-12', 'opacity-0');
    }, 2500);
}
