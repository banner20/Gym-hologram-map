class Section {
    constructor(data) {
        this.data = data;
        this.mesh = this.createSectionMesh();
        this.label = this.createLabel();
        this.heatMapActive = false;
    }

    createSectionMesh() {
        // Create section floor
        const geometry = new THREE.PlaneGeometry(
            this.data.size.width,
            this.data.size.length
        );
        const material = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });
        const floor = new THREE.Mesh(geometry, material);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(
            this.data.position.x,
            this.data.position.y,
            this.data.position.z
        );

        // Create section borders
        const borderGeometry = new THREE.BoxGeometry(
            this.data.size.width,
            0.1,
            this.data.size.length
        );
        const borderMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.3
        });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.set(
            this.data.position.x,
            this.data.position.y + 0.05,
            this.data.position.z
        );

        // Group floor and border
        const group = new THREE.Group();
        group.add(floor);
        group.add(border);

        return group;
    }

    createLabel() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;

        // Draw text
        context.fillStyle = 'white';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.data.name, canvas.width / 2, canvas.height / 2);

        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);

        // Position label above section
        sprite.position.set(
            this.data.position.x,
            this.data.position.y + 2,
            this.data.position.z
        );

        // Scale sprite
        sprite.scale.set(10, 2.5, 1);

        return sprite;
    }

    toggleHeatMap() {
        this.heatMapActive = !this.heatMapActive;
        
        // Calculate busy percentage
        const busyMachines = this.data.machines.filter(m => m.isBusy).length;
        const totalMachines = this.data.machines.length;
        const busyPercentage = busyMachines / totalMachines;

        // Update section color based on busy percentage
        const color = new THREE.Color();
        if (this.heatMapActive) {
            color.setHSL(0.3 - (busyPercentage * 0.3), 1, 0.5);
        } else {
            color.setHex(0x2a2a2a);
        }

        this.mesh.children[0].material.color = color;
    }

    getBusyPercentage() {
        const busyMachines = this.data.machines.filter(m => m.isBusy).length;
        const totalMachines = this.data.machines.length;
        return (busyMachines / totalMachines) * 100;
    }
} 