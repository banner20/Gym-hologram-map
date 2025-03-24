document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing Virtual Gym Application");
    
    // Initialize the scene
    const scene = new Scene();
    
    // Initialize the UI with the scene
    const ui = new UI(scene);
    
    // Make UI globally accessible for mirroring functions
    window.ui = ui;
    
    // Log initialization complete
    console.log("Virtual Gym Application initialized successfully");
}); 