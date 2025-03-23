class UI {
    constructor(scene) {
        this.scene = scene;
        this.workoutPlanVisible = false;
        this.currentFilter = 'all';
        this.friendsVisible = true;
        this.sectionInfoVisible = false;
        this.pathVisible = false;
        this.pathElements = [];
        this.init();
    }

    init() {
        this.createMachineFilters();
        this.createFriendsPanel();
        this.createTopBar();
        this.createBottomBar();
        this.createWorkoutPanel();
        this.createStatsPanel();
        this.setupEventListeners();
    }

    createMachineFilters() {
        const filters = document.createElement('div');
        filters.className = 'machine-filters';
        filters.innerHTML = `
            <h3>Machine Filters</h3>
            <div class="filter-buttons">
                <button class="btn active" data-filter="all">All Machines</button>
                <button class="btn" data-filter="strength">Strength</button>
                <button class="btn" data-filter="cardio">Cardio</button>
                <button class="btn" data-filter="functional">Functional</button>
            </div>
        `;

        document.getElementById('canvas-container').appendChild(filters);

        // Event listeners for filters
        filters.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                // Update active state
                filters.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // Apply filter
                this.setFilter(filter);
            });
        });
    }

    createFriendsPanel() {
        const panel = document.createElement('div');
        panel.className = 'friends-panel';
        panel.innerHTML = `
            <div class="friends-header">
                Friends in Gym (${gymData.friends.length})
            </div>
            <div class="friends-list">
                ${this.createFriendsList()}
            </div>
        `;
        // Friends panel is always visible by default
        panel.style.display = 'block';
        document.getElementById('canvas-container').appendChild(panel);
    }

    createFriendsList() {
        return gymData.friends.map(friend => `
            <div class="friend-item" data-friend-id="${friend.id}" data-machine-id="${friend.machineId}">
                <div class="friend-avatar">
                    ${friend.avatar}
                </div>
                <div class="friend-info">
                    <div class="friend-name">${friend.name}</div>
                    <div class="friend-status">${friend.status}</div>
                </div>
                <div class="friend-goto">
                    <i class="fas fa-location-arrow"></i>
                </div>
            </div>
        `).join('');
    }

    createTopBar() {
        // Just keeping it blank since we're moving everything to the other panels
        const topBar = document.createElement('div');
        topBar.className = 'top-bar';
        document.getElementById('canvas-container').appendChild(topBar);
    }

    createBottomBar() {
        const bottomBar = document.createElement('div');
        bottomBar.classList.add('bottom-bar');
        
        // Add friend button
        const showFriendsBtn = document.createElement('button');
        showFriendsBtn.id = 'showFriendsBtn';
        showFriendsBtn.classList.add('circular-button');
        showFriendsBtn.innerHTML = '<i class="fas fa-users"></i>';
        showFriendsBtn.title = 'Show Friends';
        bottomBar.appendChild(showFriendsBtn);
        
        // Add section info button (replacing heatmap)
        const sectionInfoBtn = document.createElement('button');
        sectionInfoBtn.id = 'sectionInfoBtn';
        sectionInfoBtn.classList.add('circular-button');
        sectionInfoBtn.innerHTML = '<i class="fas fa-info-circle"></i>';
        sectionInfoBtn.title = 'Section Information';
        bottomBar.appendChild(sectionInfoBtn);

        // Add path button
        const showPathBtn = document.createElement('button');
        showPathBtn.id = 'showPathBtn';
        showPathBtn.classList.add('circular-button');
        showPathBtn.innerHTML = '<i class="fas fa-route"></i>';
        showPathBtn.title = 'Show Workout Path';
        bottomBar.appendChild(showPathBtn);
        
        // Add reset view button
        const resetViewBtn = document.createElement('button');
        resetViewBtn.id = 'resetViewBtn';
        resetViewBtn.classList.add('circular-button');
        resetViewBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
        resetViewBtn.title = 'Reset Camera View';
        bottomBar.appendChild(resetViewBtn);
        
        document.body.appendChild(bottomBar);
    }

    createWorkoutPanel() {
        const panel = document.createElement('div');
        panel.className = 'workout-panel';
        panel.style.display = 'none';
        
        // Create plan selector
        const planSelector = document.createElement('div');
        planSelector.className = 'plan-selector';
        planSelector.innerHTML = `
            <h3>Workout Plans</h3>
            <div class="plan-options">
                ${this.createPlanOptions()}
            </div>
        `;
        
        // Create workout list container
        const workoutListContainer = document.createElement('div');
        workoutListContainer.className = 'workout-list-container';
        workoutListContainer.innerHTML = `
            <div class="current-plan-info">
                <h3 id="current-plan-name">${gymData.workoutPlans.plans[gymData.workoutPlans.current].name}</h3>
                <p id="current-plan-description">${gymData.workoutPlans.plans[gymData.workoutPlans.current].description}</p>
            </div>
            <div class="workout-list">
                ${this.createWorkoutList()}
            </div>
        `;
        
        panel.appendChild(planSelector);
        panel.appendChild(workoutListContainer);
        document.getElementById('canvas-container').appendChild(panel);
    }

    createPlanOptions() {
        return Object.entries(gymData.workoutPlans.plans).map(([planId, plan]) => `
            <div class="plan-option ${planId === gymData.workoutPlans.current ? 'active' : ''}" data-plan-id="${planId}">
                <h4>${plan.name}</h4>
                <p>${plan.exercises.length} exercises</p>
            </div>
        `).join('');
    }

    createWorkoutList() {
        const currentPlan = gymData.workoutPlans.plans[gymData.workoutPlans.current];
        return currentPlan.exercises.map((workout, index) => `
            <div class="workout-item" data-workout-id="${workout.id}" data-machine-id="${workout.machineId}">
                <div class="exercise-number">${index + 1}</div>
                <div class="exercise-details">
                    <h4>${workout.name}</h4>
                    <p>${workout.sets || workout.duration}</p>
                </div>
            </div>
        `).join('');
    }

    createStatsPanel() {
        const stats = document.createElement('div');
        stats.className = 'stats-panel';
        stats.innerHTML = `
            <h3>Statistics</h3>
            <div style="margin-top: 0.5rem;">
                <div class="stat-item">
                    <span class="stat-label">Current Time</span>
                    <span id="current-time">--:--</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Peak Hours</span>
                    <span>17:00 - 19:00</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Busy Areas</span>
                    <span>Strength, Cardio</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Available Machines</span>
                    <span>15/24</span>
                </div>
            </div>
            <div class="section-info" style="display: none;">
                <h3>Section Information</h3>
                <div class="sections-list">
                    ${this.createSectionInfoList()}
                </div>
            </div>
        `;

        document.getElementById('canvas-container').appendChild(stats);

        // Update current time
        setInterval(() => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            document.getElementById('current-time').textContent = timeString;
        }, 1000);
    }

    createSectionInfoList() {
        return gymData.sections.map(section => `
            <div class="section-info-item" data-section-id="${section.id}">
                <div class="section-info-header">
                    <span class="section-info-name" style="color: ${section.color}">${section.name}</span>
                    <span class="section-info-count">${this.getMachineCountInSection(section.id)}</span>
                </div>
                <div class="section-info-machines">
                    ${this.getMachineTypesInSection(section.id)}
                </div>
            </div>
        `).join('');
    }

    getMachineCountInSection(sectionId) {
        const section = gymData.sections.find(s => s.id === sectionId);
        if (section && section.machines) {
            return `${section.machines.length} machines`;
        }
        return "0 machines";
    }

    getMachineTypesInSection(sectionId) {
        const section = gymData.sections.find(s => s.id === sectionId);
        if (!section || !section.machines || section.machines.length === 0) {
            return "<span class='no-machines'>No machines in this section</span>";
        }
        
        // Count machines by type
        const typeCount = {};
        section.machines.forEach(machine => {
            if (machine.type) {
                typeCount[machine.type] = (typeCount[machine.type] || 0) + 1;
            }
        });
        
        // Format as a list
        return Object.entries(typeCount).map(([type, count]) => 
            `<span class="machine-type-count"><span class="machine-type">${type}</span>: ${count}</span>`
        ).join(', ');
    }

    setupEventListeners() {
        // Bottom bar button listeners
        document.getElementById('showFriendsBtn').addEventListener('click', () => {
            this.toggleFriendsPanel();
        });

        document.getElementById('showPathBtn').addEventListener('click', () => {
            this.toggleWorkoutPanel();
        });

        document.getElementById('resetViewBtn').addEventListener('click', () => {
            console.log('Reset view button clicked');
            this.scene.resetView();
            this.updateButtonState('resetViewBtn', true);
            setTimeout(() => {
                this.updateButtonState('resetViewBtn', false);
            }, 300);
        });

        document.getElementById('sectionInfoBtn').addEventListener('click', () => {
            this.toggleSectionInfo();
        });
        
        // Machine filter listeners
        document.querySelectorAll('.machine-filters [data-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                // Update active state
                document.querySelectorAll('.machine-filters [data-filter]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // Apply filter
                this.setFilter(filter);
            });
        });

        // Workout plan selection
        document.addEventListener('click', (e) => {
            const planOption = e.target.closest('.plan-option');
            if (planOption) {
                const planId = planOption.dataset.planId;
                this.selectWorkoutPlan(planId);
            }
        });

        // Workout item click
        document.addEventListener('click', (e) => {
            const workoutItem = e.target.closest('.workout-item');
            if (workoutItem) {
                document.querySelectorAll('.workout-item').forEach(i => i.classList.remove('active'));
                workoutItem.classList.add('active');
                
                // Highlight the corresponding machine if the path is visible
                if (this.pathVisible) {
                    const machineId = workoutItem.dataset.machineId;
                    this.highlightMachine(machineId);
                }
            }
        });
        
        // Friend item click
        document.addEventListener('click', (e) => {
            const friendItem = e.target.closest('.friend-item');
            if (friendItem) {
                const machineId = friendItem.dataset.machineId;
                if (machineId) {
                    console.log(`Navigating to friend at machine ${machineId}`);
                    this.navigateToFriend(machineId);
                } else {
                    console.error("No machine ID found for this friend");
                }
            }
        });
    }

    toggleSectionInfo() {
        this.sectionInfoVisible = !this.sectionInfoVisible;
        this.updateButtonState('sectionInfoBtn', this.sectionInfoVisible);
        
        // Show/hide the section info in the stats panel
        const sectionInfo = document.querySelector('.section-info');
        if (sectionInfo) {
            sectionInfo.style.display = this.sectionInfoVisible ? 'block' : 'none';
        }
    }

    showWorkoutPath() {
        // Clear existing path
        this.clearPath();
        
        // Get workout path from scene
        const workoutPath = this.scene.getWorkoutPath();
        if (!workoutPath || workoutPath.length === 0) {
            console.error("No workout path available");
            return;
        }
        
        console.log("Drawing workout path with", workoutPath.length, "points");
        
        // Create path elements
        for (let i = 0; i < workoutPath.length - 1; i++) {
            this.createPathSegment(workoutPath[i], workoutPath[i + 1], i + 1);
        }
        
        // Create final number marker
        this.createPathMarker(workoutPath[workoutPath.length - 1], workoutPath.length);
        
        // Update workout items to show the path sequence
        document.querySelectorAll('.workout-item').forEach((item, index) => {
            item.classList.toggle('active', index === 0);
        });
        
        // Highlight the first machine in the workout plan
        if (workoutPath.length > 0) {
            const firstMachineId = workoutPath[0].machineId;
            this.highlightMachine(firstMachineId);
        }
        
        // Add event listener to camera for updating path positions
        if (this.scene.controls) {
            this.scene.controls.addEventListener('change', () => {
                if (this.pathVisible) {
                    this.updatePathPositions(workoutPath);
                }
            });
        }
    }
    
    createPathSegment(start, end, number) {
        const container = document.getElementById('canvas-container');
        
        // Convert 3D positions to screen coordinates
        const startScreen = this.scene.projectPoint(start.position);
        const endScreen = this.scene.projectPoint(end.position);
        
        // Create line
        const line = document.createElement('div');
        line.className = 'path-line';
        line.dataset.fromMachine = start.machineId;
        line.dataset.toMachine = end.machineId;
        
        // Calculate line position and rotation
        const dx = endScreen.x - startScreen.x;
        const dy = endScreen.y - startScreen.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        line.style.width = `${length}px`;
        line.style.transform = `translate(${startScreen.x}px, ${startScreen.y}px) rotate(${angle}rad)`;
        
        this.pathElements.push(line);
        container.appendChild(line);
        
        // Create number marker at the start point
        this.createPathMarker(start, number);
    }
    
    createPathMarker(point, number) {
        const container = document.getElementById('canvas-container');
        const screenPos = this.scene.projectPoint(point.position);
        
        // Create marker
        const marker = document.createElement('div');
        marker.className = 'path-number';
        marker.textContent = number;
        marker.dataset.machineId = point.machineId;
        marker.style.left = `${screenPos.x}px`;
        marker.style.top = `${screenPos.y}px`;
        
        this.pathElements.push(marker);
        container.appendChild(marker);
        
        return { x: screenPos.x, y: screenPos.y }; // Return position for connection lines
    }
    
    updatePathPositions(workoutPath) {
        if (!workoutPath) return;
        
        // Remove all existing path elements
        this.clearPath();
        
        // Recreate the path with updated positions
        for (let i = 0; i < workoutPath.length - 1; i++) {
            this.createPathSegment(workoutPath[i], workoutPath[i + 1], i + 1);
        }
        
        // Create final number marker
        this.createPathMarker(workoutPath[workoutPath.length - 1], workoutPath.length);
    }

    clearPath() {
        this.pathElements.forEach(element => element.remove());
        this.pathElements = [];
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        if (this.scene.machines && this.scene.machines.length > 0) {
            this.scene.machines.forEach(machine => {
                if (machine.mesh) {
                    // Check if the machine should be visible based on the filter
                    const visible = filter === 'all' || machine.type === filter;
                    // Don't hide the currentUser or reception
                    const isSpecial = machine.type === 'user' || machine.id === 'receptionDesk';
                    machine.mesh.visible = isSpecial ? true : visible;
                }
            });
        }
        
        console.log(`Applied filter: ${filter}`);
    }

    highlightMachine(machineId) {
        // Reset all machine highlights
        if (this.scene.machines && this.scene.machines.length > 0) {
            this.scene.machines.forEach(machine => {
                if (machine.mesh && machine.mesh.material) {
                    machine.mesh.material.emissive = new THREE.Color(0x000000);
                    machine.mesh.material.emissiveIntensity = 0;
                }
            });
        }
        
        // Highlight the selected machine
        const machine = this.scene.machines.find(m => m.id === machineId);
        if (machine && machine.mesh && machine.mesh.material) {
            machine.mesh.material.emissive = new THREE.Color(0xffff00);
            machine.mesh.material.emissiveIntensity = 0.5;
            
            // Move camera to focus on this machine
            if (this.scene.camera && this.scene.controls) {
                this.scene.controls.target.set(
                    machine.position.x,
                    1,
                    machine.position.z
                );
                this.scene.controls.update();
            }
        }
    }

    selectWorkoutPlan(planId) {
        // Update active state in UI
        document.querySelectorAll('.plan-option').forEach(option => {
            option.classList.toggle('active', option.dataset.planId === planId);
        });
        
        // Update selected plan in data
        gymData.workoutPlans.current = planId;
        const currentPlan = gymData.workoutPlans.plans[planId];
        
        // Update plan info
        document.getElementById('current-plan-name').textContent = currentPlan.name;
        document.getElementById('current-plan-description').textContent = currentPlan.description;
        
        // Update workout list
        const workoutList = document.querySelector('.workout-list');
        workoutList.innerHTML = this.createWorkoutList();
        
        // If path is visible, update it with the new plan
        if (this.pathVisible) {
            this.clearPath();
            this.showWorkoutPath();
        }
    }

    // New method to navigate to a friend
    navigateToFriend(machineId) {
        console.log(`Navigating to friend at machine ${machineId}`);
        
        // Find the machine where the friend is
        const machine = this.scene.machines.find(m => m.id === machineId);
        if (!machine) {
            console.error(`No machine found with ID: ${machineId}`);
            return;
        }
        
        console.log("Found machine:", machine);
        
        // Move camera to focus on this friend's machine
        if (this.scene.camera && this.scene.controls) {
            // Animate the camera movement for a smoother experience
            gsap.to(this.scene.controls.target, {
                x: machine.position.x,
                y: 1,
                z: machine.position.z,
                duration: 1,
                ease: 'power2.inOut',
                onUpdate: () => {
                    this.scene.controls.update();
                }
            });
            
            // Also move the camera position a bit to get a better view
            gsap.to(this.scene.camera.position, {
                x: machine.position.x + 15,
                y: 20,
                z: machine.position.z + 15,
                duration: 1,
                ease: 'power2.inOut',
                onUpdate: () => {
                    this.scene.camera.lookAt(machine.position.x, 1, machine.position.z);
                    this.scene.controls.update();
                }
            });
            
            // Create a temporary highlight effect
            if (machine.mesh && machine.mesh.material) {
                // Save the original material properties
                const originalEmissive = machine.mesh.material.emissive.clone();
                const originalEmissiveIntensity = machine.mesh.material.emissiveIntensity;
                
                // Apply highlight
                machine.mesh.material.emissive.set(0xec4899); // Pink for friends
                machine.mesh.material.emissiveIntensity = 0.8;
                
                // Create a pulsating highlight effect
                const highlightAnimation = gsap.timeline({repeat: 3, yoyo: true});
                highlightAnimation.to(machine.mesh.scale, {
                    x: 1.2, 
                    y: 1.2, 
                    z: 1.2, 
                    duration: 0.5,
                    ease: 'power2.inOut'
                });
                
                // Reset after animation completes
                setTimeout(() => {
                    gsap.to(machine.mesh.scale, {
                        x: 1, 
                        y: 1, 
                        z: 1, 
                        duration: 0.5
                    });
                    machine.mesh.material.emissive.copy(originalEmissive);
                    machine.mesh.material.emissiveIntensity = originalEmissiveIntensity;
                }, 4000);
            }
        }
    }

    // Ensure reset button is properly styled
    updateButtonState(buttonId, active) {
        const button = document.getElementById(buttonId);
        if (button) {
            // Update button styling to show it's active/clicked
            if (active) {
                button.classList.add('active');
                // Add a subtle transform to show button press
                button.style.transform = 'scale(0.95)';
            } else {
                button.classList.remove('active');
                button.style.transform = 'scale(1)';
            }
        }
    }

    toggleFriendsPanel() {
        this.friendsVisible = !this.friendsVisible;
        this.updateButtonState('showFriendsBtn', this.friendsVisible);
        
        const friendsPanel = document.querySelector('.friends-panel');
        if (friendsPanel) {
            friendsPanel.style.display = this.friendsVisible ? 'block' : 'none';
        }
    }

    toggleWorkoutPanel() {
        this.pathVisible = !this.pathVisible;
        this.updateButtonState('showPathBtn', this.pathVisible);
        
        const workoutPanel = document.querySelector('.workout-panel');
        if (workoutPanel) {
            workoutPanel.style.display = this.pathVisible ? 'block' : 'none';
        }
        
        if (this.pathVisible) {
            console.log("Showing workout path");
            this.showWorkoutPath();
        } else {
            console.log("Hiding workout path");
            this.clearPath();
        }
    }
} 