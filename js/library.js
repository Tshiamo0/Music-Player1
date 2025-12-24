(function(){
    // Attempt to load songs from /songs folder
    // Handles both JSON endpoint and HTML directory listings
    async function loadSongs(){
        const tracksEl = document.getElementById('library-tracks');
        if(!tracksEl) return;
        tracksEl.innerHTML = 'Loading songs...';
        
        try{
            // Try JSON endpoint first
            const res = await fetch('/api/songs', { cache: 'no-store' });
            if(!res.ok) throw new Error('Failed to fetch songs');
            
            const ct = res.headers.get('content-type') || '';
            let files = [];
            
            if(ct.includes('application/json')){
                files = await res.json();
            } else if(ct.includes('text/html')){
                // Parse HTML directory listing
                const html = await res.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                files = Array.from(doc.querySelectorAll('a'))
                    .map(a => a.getAttribute('href'))
                    .filter(h => h && !h.endsWith('/') && !h.startsWith('?'));
            }
            
            if(!Array.isArray(files)) files = [];
            files = files.map(f => String(f).trim()).filter(f => f && 
                /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(f));
            files = Array.from(new Set(files)).sort();
            
            if(files.length === 0){
                tracksEl.innerHTML = '<p>No audio files found in the songs folder.</p>';
                return;
            }
            
            tracksEl.innerHTML = '';
            files.forEach(filename => {
                const item = document.createElement('div');
                item.className = 'song-item';
                
                const title = document.createElement('div');
                title.className = 'song-title';
                title.textContent = decodeURIComponent(filename);
                
                const audio = document.createElement('audio');
                audio.controls = true;
                audio.preload = 'metadata';
                audio.src = '/songs/' + encodeURIComponent(filename);
                
                item.appendChild(title);
                item.appendChild(audio);
                tracksEl.appendChild(item);
            });
        }catch(err){
            tracksEl.innerHTML = '<p>Could not load songs from folder. Make sure songs are in the `/songs` directory and the server exposes them.</p>';
            console.error('Error loading songs:', err);
        }
    }
    
    // Handle upload form
    function initUploadHandler(){
        const uploadForm = document.getElementById('upload-form');
        if(!uploadForm) return;
        const fileInput = document.getElementById('file');
        const status = document.getElementById('upload-status');
        const uploadBtn = document.getElementById('upload-btn');
        console.log('[library] initUploadHandler');

        uploadForm.addEventListener('submit', async function(e){
            e.preventDefault();
            console.log('[library] submit handler triggered');
            if(!fileInput.files.length){
                status.textContent = 'Please select a file.';
                status.classList.remove('success');
                status.classList.add('error');
                return;
            }
            const fd = new FormData();
            fd.append('file', fileInput.files[0]);
            if(uploadBtn) uploadBtn.disabled = true;
            status.textContent = 'Uploading...';
            status.classList.remove('success','error');
            try{
                const res = await fetch('/upload', { method: 'POST', body: fd });
                if(!res.ok){
                    let msg = 'Upload failed';
                    try{ const errBody = await res.json(); msg = errBody.error || errBody.message || msg }catch(e){}
                    throw new Error(msg);
                }
                const data = await res.json();
                console.log('[library] upload succeeded', data);
                status.textContent = '✓ ' + (data.message || 'Upload successful!');
                status.classList.add('success');
                fileInput.value = '';
                setTimeout(loadSongs, 500);
            }catch(err){
                console.error('[library] upload error', err);
                status.textContent = '✗ Upload error: ' + err.message;
                status.classList.add('error');
            }finally{
                if(uploadBtn) uploadBtn.disabled = false;
            }
        });
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', function(){
        loadSongs();
        initUploadHandler();
    });

})();
