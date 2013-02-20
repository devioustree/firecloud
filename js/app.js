require(['https://connect.soundcloud.com/sdk.js'],
    function() {
        var accessToken = localStorage.getItem('FC.accessToken');
        
        if (accessToken !== null) {
            SC.storage().setItem('SC.accessToken', accessToken);
        }
        
        initialiseSoundCloud();
        
        var btnSoundcloud = document.querySelector("#soundcloud-btn");
        btnSoundcloud.addEventListener('click', handleSoundcloudButtonClick);
        
        var trackList = document.querySelector('#track-list ul');
        
        var currentSound = undefined;
        
        if (accessToken !== null) {
            getTracks();
        }
        
        function initialiseSoundCloud() {
            SC.initialize({
                client_id: '006a65d1b4ba71d8b6633d74b5a5cf9b',
                redirect_uri: 'http://devioustree.co.uk/firecloud/callback.html'
            });
        }
        
        function handleSoundcloudButtonClick() {
            SC.connect(function(){
                var accessToken = SC.storage().getItem('SC.accessToken');
                localStorage.setItem('FC.accessToken', accessToken);
                
                getTracks();
            });
        }
        
        function getTracks() {
            SC.get("/me/activities", function(response) {
                var activities = response.collection;
                activities.forEach(parseActivity);
                
                if (response.next_href) {
                    SC.get(response.next_href, function(response) {
                        var activities = response.collection;
                        activities.forEach(parseActivity);
                    });
                }
            });
        }
        
        function parseActivity(activity) {
            if (activity.type === 'track') {
                var track = activity.origin;
                var user = track.user;
                
                var trackURL = '/tracks/' + track.id;
                var li = document.createElement('li');
                li.style.backgroundImage = 'url('+track.waveform_url+')';
                
                var aside = document.createElement('aside');
                var coverImage = document.createElement('img');
                var title = document.createElement('p');
                var artist = document.createElement('p');
                
                aside.appendChild(coverImage);
                li.appendChild(aside);
                li.appendChild(title);
                li.appendChild(artist);
                
                coverImage.src = track.artwork_url;
                title.innerHTML = track.title;
                artist.innerHTML = user.username;
                
                li.addEventListener('click', trackClickListener(trackURL));
                trackList.appendChild(li);
            }
        }
        
        function trackClickListener(trackURL) {
            return function() {
                var li = this;
                
                var currentlySelected = document.querySelector('li.selected');
                
                if (currentlySelected === li) {
                    if (currentSound.paused) {
                        currentSound.resume()
                    } else{
                        currentSound.pause()
                    }
                } else {
                    if (currentlySelected !== null) {
                        currentlySelected.classList.remove('selected');
                    }
                    li.classList.add('selected');
                    
                    SC.stream(trackURL, function(sound){
                        if (currentSound !== undefined) {
                            currentSound.stop();
                        }
                        
                        currentSound = sound;
                        currentSound.play({
                            onfinish: function() {
                                if (li.nextSibling) {
                                    var clickEvent = document.createEvent('Event');
                                    clickEvent.initEvent('click', true, true);
                                    
                                    li.nextSibling.dispatchEvent(clickEvent);
                                }
                            },
                            whileplaying: function() {
                                var position = this.position;
                                var duration = (this.readyState == 3) ? this.duration : this.durationEstimate;
                                var howFar = position / duration;
                                console.log('Playing: ' + position + ' / ' + duration + ' = ' + howFar);
                            }
                        });
                    });
                }
            }
        }
    }
);