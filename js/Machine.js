class Machine {
    constructor(data) {
        this.data = data;
        this.mesh = this.createMachineMesh();
        this.infoBox = this.createInfoBox();
    }

    createMachineMesh() {
        // Create machine base
        const geometry = new THREE.BoxGeometry(2, 0.5, 2);
        const material = new THREE.MeshStandardMaterial({
            color: this.data.isBusy ? 0xff0000 : 0x00ff00,
            transparent: true,
            opacity: 0.8
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            this.data.position.x,
            this.data.position.y + 0.25,
            this.data.position.z
        );

        // Add hover effect
        mesh.userData = {
            isMachine: true,
            machineData: this.data
        };

        return mesh;
    }

    createInfoBox() {
        const infoBox = document.createElement('div');
        infoBox.className = 'machine-info';
        infoBox.style.display = 'none';
        infoBox.innerHTML = `
            <h3>${this.data.name}</h3>
            <p>Status: ${this.data.isBusy ? 'Busy' : 'Available'}</p>
        `;
        document.body.appendChild(infoBox);
        return infoBox;
    }

    showInfo(event) {
        this.infoBox.style.display = 'block';
        this.infoBox.style.left = event.clientX + 10 + 'px';
        this.infoBox.style.top = event.clientY + 10 + 'px';
    }

    hideInfo() {
        this.infoBox.style.display = 'none';
    }

    updateStatus(isBusy) {
        this.data.isBusy = isBusy;
        this.mesh.material.color.setHex(isBusy ? 0xff0000 : 0x00ff00);
    }
} 