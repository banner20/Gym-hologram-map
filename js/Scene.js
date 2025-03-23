class Scene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.sections = [];
        this.machines = [];
        this.friends = [];
        this.people = [];
        this.initialCameraPosition = { x: 0, y: 40, z: 50 };
        this.sectionDensities = new Map();
        this.workoutPlan = gymData.workoutPlan;
        this.currentWorkoutPlanId = gymData.workoutPlans.current;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredObject = null;
        this.hoverInfoElement = null;
        this.sectionLabels = [];
        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLighting();
        this.setupControls();
        this.createEnvironment();
        this.createSections();
        this.createMachines();
        this.createFriends();
        this.createCurrentUser();
        this.createWallsAndDoor();
        this.createRandomPeople();
        this.createDensityPanel();
        this.animate();
        this.createResetViewButton();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(
            this.initialCameraPosition.x,
            this.initialCameraPosition.y,
            this.initialCameraPosition.z
        );
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        window.addEventListener('resize', () => this.handleResize());
        
        // Add mouse event listeners for interaction
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
        this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Main directional light with shadows
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(50, 100, 50);
        mainLight.castShadow = true;
        
        // Configure shadow properties
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 500;
        mainLight.shadow.camera.left = -100;
        mainLight.shadow.camera.right = 100;
        mainLight.shadow.camera.top = 100;
        mainLight.shadow.camera.bottom = -100;
        
        this.scene.add(mainLight);

        // Fill light from the opposite side
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
        fillLight.position.set(-50, 80, -50);
        this.scene.add(fillLight);

        // Back light for rim lighting
        const backLight = new THREE.DirectionalLight(0xffffff, 0.2);
        backLight.position.set(0, 50, -100);
        this.scene.add(backLight);
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 100;
        this.controls.maxPolarAngle = Math.PI / 2;
    }

    createEnvironment() {
        // Grid floor
        const gridHelper = new THREE.GridHelper(200, 50, 0x555555, 0x222222);
        this.scene.add(gridHelper);

        // Floor plane
        const planeGeometry = new THREE.PlaneGeometry(200, 200);
        const planeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x111111, 
            transparent: true, 
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.01; // Slightly below grid to prevent z-fighting
        plane.receiveShadow = true;
        this.scene.add(plane);
    }

    createSections() {
        gymData.sections.forEach(sectionData => {
            const geometry = new THREE.BoxGeometry(sectionData.size.width, 0.1, sectionData.size.length);
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color(sectionData.color),
                transparent: true,
                opacity: 0.2,
                side: THREE.DoubleSide
            });

            const section = new THREE.Mesh(geometry, material);
            section.position.set(sectionData.position.x, 0.05, sectionData.position.z);
            section.receiveShadow = true;
            section.userData = { 
                id: sectionData.id, 
                name: sectionData.name,
                type: 'section'
            };
            
            this.scene.add(section);
            this.sections.push(section);

            // Add section label
            this.createSectionLabel(sectionData);
        });
    }

    createSectionLabel(sectionData) {
        // Create 3D text for the section name
        const text = document.createElement('div');
        text.className = 'section-3d-label';
        text.textContent = sectionData.name;
        text.style.color = 'white';
        text.style.fontWeight = 'bold';
        text.style.padding = '3px 6px';
        text.style.backgroundColor = sectionData.color;
        text.style.borderRadius = '4px';
        text.style.position = 'absolute';
        text.style.zIndex = '10';
        text.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        text.style.whiteSpace = 'nowrap';
        text.style.fontSize = '12px';
        
        // Store the 3D position for the label - increase height (y-value)
        text.dataset.posX = sectionData.position.x;
        text.dataset.posY = 12; // Height above the section - increased from 8 to 12
        text.dataset.posZ = sectionData.position.z;
        
        document.getElementById('canvas-container').appendChild(text);
        
        // Add to a list to update positions when camera moves
        if (!this.sectionLabels) this.sectionLabels = [];
        this.sectionLabels.push(text);
        
        // Create the 2D section visualization (unchanged)
        const labelDiv = document.createElement('div');
        labelDiv.className = 'section';
        labelDiv.dataset.sectionId = sectionData.id;
        labelDiv.style.left = `calc(50% + ${sectionData.position.x * 2 - sectionData.size.width}px)`;
        labelDiv.style.top = `calc(50% + ${sectionData.position.z * 2 - sectionData.size.length}px)`;
        labelDiv.style.width = `${sectionData.size.width * 2}px`;
        labelDiv.style.height = `${sectionData.size.length * 2}px`;
        labelDiv.style.backgroundColor = `${sectionData.color}33`; // 20% opacity
        document.getElementById('canvas-container').appendChild(labelDiv);
    }

    createMachines() {
        const allMachines = [];
        
        // Gather all machines from all sections
        gymData.sections.forEach(section => {
            if (section.machines && section.machines.length > 0) {
                section.machines.forEach(machine => {
                    // Add section info to the machine data
                    machine.sectionId = section.id;
                    machine.sectionName = section.name;
                    allMachines.push(machine);
                });
            }
        });
        
        // Create 3D models for each machine
        allMachines.forEach(machineData => {
            this.createMachine(machineData);
        });
    }

    createMachine(machineData) {
        let geometry, material;
        
        // Different geometries based on machine type
        switch(machineData.type) {
            case 'strength':
                geometry = new THREE.BoxGeometry(3, 2, 2.5);
                break;
            case 'cardio':
                geometry = new THREE.BoxGeometry(2.5, 1.5, 4);
                break;
            case 'functional':
                geometry = new THREE.BoxGeometry(2, 2, 2);
                break;
            case 'user':
                geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 16);
                material = new THREE.MeshPhongMaterial({ 
                    color: 0xffd700,
                    emissive: 0xffd700,
                    emissiveIntensity: 0.3
                });
                break;
            default:
                geometry = new THREE.BoxGeometry(2, 1, 2);
        }
        
        // Color code based on availability status if not already set
        if (!material) {
            // Base color is now determined primarily by status (availability)
            let baseColor, emissiveColor, emissiveIntensity;
            
            // First determine the status color
            switch(machineData.status) {
                case 'available':
                    baseColor = 0x4ade80;  // Green for available
                    emissiveColor = 0x4ade80;
                    emissiveIntensity = 0.4;
                    break;
                case 'busy':
                    baseColor = 0xf87171;  // Red for busy
                    emissiveColor = 0xf87171;
                    emissiveIntensity = 0.3;
                    break;
                case 'maintenance':
                    baseColor = 0xfacc15;  // Yellow for maintenance
                    emissiveColor = 0xfacc15;
                    emissiveIntensity = 0.3;
                    break;
                default:
                    baseColor = 0x9ca3af;  // Gray for unknown status
                    emissiveColor = 0x000000;
                    emissiveIntensity = 0;
            }
            
            // Slightly adjust the hue based on machine type
            // This way status is primary indicator but type is still visible
            let finalColor = baseColor;
            switch(machineData.type) {
                case 'strength':
                    // Add slight blue tint to the base color
                    finalColor = this.blendColors(baseColor, 0x3b82f6, 0.3);
                    break;
                case 'cardio':
                    // Add slight purple tint to the base color
                    finalColor = this.blendColors(baseColor, 0xa78bfa, 0.3);
                    break;
                case 'functional':
                    // Add slight orange tint to the base color
                    finalColor = this.blendColors(baseColor, 0xf59e0b, 0.3);
                    break;
            }
            
            material = new THREE.MeshPhongMaterial({
                color: finalColor,
                emissive: emissiveColor,
                emissiveIntensity: emissiveIntensity,
                shininess: 50
            });
        }
        
        const machine = new THREE.Mesh(geometry, material);
        machine.position.set(machineData.position.x, geometry.parameters.height / 2, machineData.position.z);
        machine.castShadow = true;
        machine.receiveShadow = true;
        
        // Add status indicator with color based on status
        this.addStatusIndicator(machine, machineData.status);
        
        // Store machine data for hover info
        machine.userData = { 
            ...machineData,
            type: machineData.type,
            isInteractive: true
        };
        
        this.scene.add(machine);
        this.machines.push({
            mesh: machine,
            ...machineData
        });
    }

    // Utility method to blend colors
    blendColors(color1, color2, ratio) {
        // Convert hex colors to RGB
        const c1 = new THREE.Color(color1);
        const c2 = new THREE.Color(color2);
        
        // Blend the colors
        const blended = new THREE.Color(
            c1.r * (1 - ratio) + c2.r * ratio,
            c1.g * (1 - ratio) + c2.g * ratio,
            c1.b * (1 - ratio) + c2.b * ratio
        );
        
        // Convert back to hex
        return blended.getHex();
    }

    addStatusIndicator(machine, status) {
        // Create a small sphere above the machine to indicate status
        const geometry = new THREE.SphereGeometry(0.4, 16, 16); // Slightly larger indicator
        let color;
        
        switch(status) {
            case 'available':
                color = 0x4ade80; // Green
                break;
            case 'busy':
                color = 0xf87171; // Red
                break;
            case 'maintenance':
                color = 0xfacc15; // Yellow
                break;
            case 'active':
                color = 0x3b82f6; // Blue
                break;
            default:
                color = 0x9ca3af; // Gray
        }
        
        const material = new THREE.MeshBasicMaterial({
            color: color
        });
        
        const indicator = new THREE.Mesh(geometry, material);
        const machineHeight = machine.geometry.parameters.height;
        indicator.position.y = machineHeight + 0.6; // Position slightly higher
        
        // Add a point light for glow effect
        const light = new THREE.PointLight(color, 0.8, 4); // Increased intensity and range
        light.position.set(0, machineHeight + 0.6, 0);
        machine.add(light);
        
        machine.add(indicator);
    }

    createFriends() {
        gymData.friends.forEach(friend => {
            // Find the machine this friend is using
            const machine = this.machines.find(m => m.id === friend.machineId);
            
            if (machine && machine.mesh) {
                // Create friend marker
                const geometry = new THREE.CylinderGeometry(0.7, 0.7, 3, 16);
                const material = new THREE.MeshPhongMaterial({ color: 0xec4899 }); // Pink color for friends
                
                const friendMesh = new THREE.Mesh(geometry, material);
                friendMesh.position.set(
                    machine.position.x + 1, // Offset slightly from the machine
                    1.5,
                    machine.position.z + 1
                );
                friendMesh.userData = {
                    name: friend.name,
                    status: friend.status,
                    type: 'friend'
                };
                
                // Add avatar floating above
                const avatarGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16);
                const avatarMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
                const avatar = new THREE.Mesh(avatarGeom, avatarMat);
                avatar.position.y = 2;
                friendMesh.add(avatar);
                
                this.scene.add(friendMesh);
                this.friends.push({
                    mesh: friendMesh,
                    ...friend
                });
            }
        });
    }

    createCurrentUser() {
        // Find the "You are here" machine data
        const currentUserMachine = this.machines.find(m => m.id === 'currentUser');
        
        if (currentUserMachine && currentUserMachine.mesh) {
            // Make it more noticeable
            currentUserMachine.mesh.material.color.set(0xffd700); // Gold
            currentUserMachine.mesh.scale.set(1.2, 1.2, 1.2);
            
            // Add a 3D text label
            const labelDiv = document.createElement('div');
            labelDiv.className = 'section-3d-label';
            labelDiv.textContent = 'YOU ARE HERE';
            labelDiv.style.position = 'absolute';
            labelDiv.style.color = '#ffd700';
            labelDiv.style.fontWeight = 'bold';
            labelDiv.style.textShadow = '0 0 10px rgba(0,0,0,0.8)';
            labelDiv.style.backgroundColor = 'rgba(0,0,0,0.6)';
            labelDiv.style.padding = '3px 6px';
            labelDiv.style.borderRadius = '4px';
            
            // Store the 3D position for the label
            labelDiv.dataset.posX = currentUserMachine.position.x;
            labelDiv.dataset.posY = 10; // Higher than regular section labels
            labelDiv.dataset.posZ = currentUserMachine.position.z;
            
            document.getElementById('canvas-container').appendChild(labelDiv);
            
            // Add to section labels array to update with camera
            if (!this.sectionLabels) this.sectionLabels = [];
            this.sectionLabels.push(labelDiv);
        }
    }

    createWallsAndDoor() {
        // Create walls around the perimeter
        const wallMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x333333,
            transparent: true,
            opacity: 0.7
        });
        
        // Dimensions for the walls
        const wallHeight = 5;
        const wallWidth = 1;
        const gymWidth = 100; // Width of the gym space
        const gymLength = 80; // Length of the gym space
        
        // North wall (with door gap)
        const northWallLeftGeom = new THREE.BoxGeometry(gymWidth/2 - 5, wallHeight, wallWidth);
        const northWallLeft = new THREE.Mesh(northWallLeftGeom, wallMaterial);
        northWallLeft.position.set(-gymWidth/4 - 2.5, wallHeight/2, -gymLength/2);
        this.scene.add(northWallLeft);
        
        const northWallRightGeom = new THREE.BoxGeometry(gymWidth/2 - 5, wallHeight, wallWidth);
        const northWallRight = new THREE.Mesh(northWallRightGeom, wallMaterial);
        northWallRight.position.set(gymWidth/4 + 2.5, wallHeight/2, -gymLength/2);
        this.scene.add(northWallRight);
        
        // East wall
        const eastWallGeom = new THREE.BoxGeometry(wallWidth, wallHeight, gymLength);
        const eastWall = new THREE.Mesh(eastWallGeom, wallMaterial);
        eastWall.position.set(gymWidth/2, wallHeight/2, 0);
        this.scene.add(eastWall);
        
        // South wall
        const southWallGeom = new THREE.BoxGeometry(gymWidth, wallHeight, wallWidth);
        const southWall = new THREE.Mesh(southWallGeom, wallMaterial);
        southWall.position.set(0, wallHeight/2, gymLength/2);
        this.scene.add(southWall);
        
        // West wall
        const westWallGeom = new THREE.BoxGeometry(wallWidth, wallHeight, gymLength);
        const westWall = new THREE.Mesh(westWallGeom, wallMaterial);
        westWall.position.set(-gymWidth/2, wallHeight/2, 0);
        this.scene.add(westWall);
        
        // Door frame
        const doorMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
        const doorFrameGeom = new THREE.BoxGeometry(10, wallHeight, 1);
        const doorFrame = new THREE.Mesh(doorFrameGeom, doorMaterial);
        doorFrame.position.set(0, wallHeight/2, -gymLength/2);
        this.scene.add(doorFrame);
        
        // Entry sign as 3D label
        const signDiv = document.createElement('div');
        signDiv.className = 'section-3d-label';
        signDiv.textContent = 'ENTRANCE';
        signDiv.style.position = 'absolute';
        signDiv.style.color = 'white';
        signDiv.style.fontSize = '16px';
        signDiv.style.fontWeight = 'bold';
        signDiv.style.backgroundColor = 'rgba(139, 69, 19, 0.8)';
        signDiv.style.padding = '3px 6px';
        signDiv.style.borderRadius = '4px';
        
        // Store the 3D position for the label
        signDiv.dataset.posX = 0;
        signDiv.dataset.posY = 12; // Higher than section labels
        signDiv.dataset.posZ = -gymLength/2;
        
        document.getElementById('canvas-container').appendChild(signDiv);
        
        // Add to section labels array to update with camera
        if (!this.sectionLabels) this.sectionLabels = [];
        this.sectionLabels.push(signDiv);
    }

    createRandomPeople() {
        const peopleCount = 30; // Adjust this number for more or fewer people
        const dotGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const dotMaterial = new THREE.MeshStandardMaterial({
            color: 0x9b59b6,
            emissive: 0x8e44ad,
            emissiveIntensity: 0.3,
            metalness: 0.8,
            roughness: 0.2
        });

        gymData.sections.forEach(section => {
            if (!section.isReception) {
                const sectionPeople = Math.floor(Math.random() * 8) + 2; // 2-10 people per section
                for (let i = 0; i < sectionPeople; i++) {
                    const person = new THREE.Mesh(dotGeometry, dotMaterial);
                    
                    // Random position within section bounds
                    const x = section.position.x + (Math.random() * section.size.width - section.size.width / 2);
                    const z = section.position.z + (Math.random() * section.size.length - section.size.length / 2);
                    
                    person.position.set(x, 0.5, z);
                    person.castShadow = true;
                    this.people.push(person);
                    this.scene.add(person);

                    // Update section density
                    const density = this.sectionDensities.get(section.id) || 0;
                    this.sectionDensities.set(section.id, density + 1);
                }
            }
        });
    }

    createDensityPanel() {
        const densityPanel = document.createElement('div');
        densityPanel.className = 'floating-panel density-panel';
        densityPanel.innerHTML = '<h3>Section Density</h3>';

        gymData.sections.forEach(section => {
            if (!section.isReception) {
                const density = this.sectionDensities.get(section.id) || 0;
                const maxDensity = 10;
                const percentage = (density / maxDensity) * 100;

                const sectionDensity = document.createElement('div');
                sectionDensity.className = 'section-density';
                sectionDensity.innerHTML = `
                    <div class="section-density-header">
                        <span class="section-density-name">${section.name}</span>
                        <span class="section-density-value">${density}/${maxDensity}</span>
                    </div>
                    <div class="density-indicator">
                        <div class="density-bar" style="width: ${percentage}%"></div>
                    </div>
                `;
                densityPanel.appendChild(sectionDensity);
            }
        });

        const rightSidebar = document.createElement('div');
        rightSidebar.className = 'right-sidebar';
        rightSidebar.appendChild(densityPanel);
        document.getElementById('canvas-container').appendChild(rightSidebar);
    }

    createResetViewButton() {
        const button = document.createElement('button');
        button.className = 'reset-view-btn';
        button.textContent = 'Reset View';
        button.addEventListener('click', () => this.resetView());
        document.getElementById('canvas-container').appendChild(button);
    }

    resetView() {
        console.log("Resetting camera view");
        gsap.to(this.camera.position, {
            x: this.initialCameraPosition.x,
            y: this.initialCameraPosition.y,
            z: this.initialCameraPosition.z,
            duration: 1,
            ease: 'power2.inOut',
            onUpdate: () => {
                this.camera.lookAt(0, 0, 0);
            },
            onComplete: () => {
                this.controls.target.set(0, 0, 0);
                this.controls.update();
            }
        });
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Perform raycasting for hover effects
        this.checkIntersections();
        
        // Animate friends slightly
        if (this.friends && this.friends.length > 0) {
            this.friends.forEach(friend => {
                if (friend.mesh) {
                    friend.mesh.rotation.y += 0.01;
                }
            });
        }
        
        // Update section label positions
        this.updateSectionLabels();
        
        this.renderer.render(this.scene, this.camera);
    }

    onMouseMove(event) {
        // Calculate mouse position in normalized device coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    onMouseClick(event) {
        // Check if we clicked on a machine
        if (this.hoveredObject && this.hoveredObject.userData && this.hoveredObject.userData.isInteractive) {
            console.log('Clicked on:', this.hoveredObject.userData);
            
            // If it's a machine in the workout plan, highlight it
            if (this.hoveredObject.userData.id) {
                const workoutItem = document.querySelector(`.workout-item[data-machine-id="${this.hoveredObject.userData.id}"]`);
                if (workoutItem) {
                    workoutItem.click();
                }
            }
        }
    }

    checkIntersections() {
        // Only proceed if we have initialized objects
        if (!this.camera || !this.raycaster) return;
        
        // Update the raycaster with the current mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Get all interactive objects
        const interactiveObjects = this.scene.children.filter(obj => 
            obj.userData && obj.userData.isInteractive
        );
        
        // Perform the raycasting
        const intersects = this.raycaster.intersectObjects(interactiveObjects, true);
        
        if (intersects.length > 0) {
            // Get the first intersected object (closest to camera)
            const object = this.findParentWithUserData(intersects[0].object);
            
            // If we're hovering a new object
            if (this.hoveredObject !== object) {
                // Reset previous hover effect if any
                if (this.hoveredObject) {
                    this.hideHoverInfo();
                }
                
                // Set new hovered object
                this.hoveredObject = object;
                
                // Show info if object has user data
                if (object.userData) {
                    this.showHoverInfo(object, intersects[0].point);
                }
            }
        } else if (this.hoveredObject) {
            // No longer hovering any object
            this.hideHoverInfo();
            this.hoveredObject = null;
        }
    }

    findParentWithUserData(object) {
        // Traverse up the parent chain to find the object with userData
        let current = object;
        while (current) {
            if (current.userData && current.userData.name) {
                return current;
            }
            current = current.parent;
        }
        return object;
    }

    showHoverInfo(object, position) {
        // Create hover info element if it doesn't exist
        if (!this.hoverInfoElement) {
            this.hoverInfoElement = document.createElement('div');
            this.hoverInfoElement.className = 'machine-info';
            document.getElementById('canvas-container').appendChild(this.hoverInfoElement);
        }
        
        // Get data from the object
        const data = object.userData;
        
        // Set content based on type
        if (data.type === 'user') {
            this.hoverInfoElement.innerHTML = `
                <h4>${data.name}</h4>
                <p>Your current location</p>
            `;
        } else if (data.type === 'friend') {
            this.hoverInfoElement.innerHTML = `
                <h4>${data.name}</h4>
                <p>${data.status}</p>
            `;
        } else {
            // It's a machine
            this.hoverInfoElement.innerHTML = `
                <h4>${data.name}</h4>
                <p>Type: ${data.type.charAt(0).toUpperCase() + data.type.slice(1)}</p>
                <p>Status: ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}</p>
                ${data.description ? `<p>${data.description}</p>` : ''}
                ${data.sectionName ? `<p>Location: ${data.sectionName}</p>` : ''}
            `;
        }
        
        // Position the info panel near the object
        const screenPosition = this.projectPoint(position);
        this.hoverInfoElement.style.left = `${screenPosition.x + 20}px`;
        this.hoverInfoElement.style.top = `${screenPosition.y - 20}px`;
        
        // Make it visible
        this.hoverInfoElement.classList.add('visible');
    }

    hideHoverInfo() {
        if (this.hoverInfoElement) {
            this.hoverInfoElement.classList.remove('visible');
        }
    }

    // Utility method to convert 3D coordinates to screen coordinates for path visualization
    projectPoint(point3D) {
        // Ensure we have a proper vector
        const vector = new THREE.Vector3(
            point3D.x || 0, 
            point3D.y || 0, 
            point3D.z || 0
        );
        
        // Project to screen coordinates
        vector.project(this.camera);
        
        // Convert normalized coordinates to screen coordinates
        return {
            x: (vector.x * 0.5 + 0.5) * window.innerWidth,
            y: (-(vector.y) * 0.5 + 0.5) * window.innerHeight
        };
    }

    // Get workout machine positions for path planning
    getWorkoutPath() {
        const path = [];
        
        // Get the current workout plan
        const currentPlan = gymData.workoutPlans.plans[gymData.workoutPlans.current];
        
        if (currentPlan && currentPlan.exercises && currentPlan.exercises.length > 0) {
            currentPlan.exercises.forEach(workout => {
                const machine = this.machines.find(m => m.id === workout.machineId);
                if (machine) {
                    path.push({
                        id: workout.id,
                        name: workout.name,
                        position: machine.position,
                        machineId: machine.id
                    });
                }
            });
        }
        
        return path;
    }

    // New method to update section labels based on camera position
    updateSectionLabels() {
        if (!this.sectionLabels || !this.camera) return;
        
        this.sectionLabels.forEach(label => {
            if (!label.dataset) return;
            
            const x = parseFloat(label.dataset.posX || 0);
            const y = parseFloat(label.dataset.posY || 0);
            const z = parseFloat(label.dataset.posZ || 0);
            
            // Project point from 3D to 2D
            const pos = this.projectPoint({x, y, z});
            
            // Update label position
            label.style.left = `${pos.x}px`;
            label.style.top = `${pos.y}px`;
            
            // Calculate distance from camera to point
            const distance = this.camera.position.distanceTo(new THREE.Vector3(x, y, z));
            
            // Scale based on distance for better perspective
            const scale = Math.max(0.6, Math.min(1.2, 40 / distance));
            label.style.transform = `translate(-50%, -50%) scale(${scale})`;
            
            // Determine if the point is in front of the camera
            const cameraDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
            const pointDirection = new THREE.Vector3(x, y, z).sub(this.camera.position).normalize();
            const dotProduct = cameraDirection.dot(pointDirection);
            
            // Hide if behind the camera (dot product negative)
            if (dotProduct < 0.1) {
                label.style.opacity = '0';
            } else {
                // Fade in based on how directly in front it is
                label.style.opacity = Math.min(1, dotProduct).toString();
            }
        });
    }
} 