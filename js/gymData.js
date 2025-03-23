const gymData = {
    name: "Virtual Fitness Center",
    sections: [
        {
            id: "strength",
            name: "Strength Section",
            position: { x: -30, z: -10 },
            size: { width: 25, length: 20 },
            color: "#3b82f6",
            machines: [
                { id: "benchPress1", name: "Bench Press 1", type: "strength", position: { x: -25, z: -15 }, status: "available", description: "Flat bench press for chest workouts" },
                { id: "benchPress2", name: "Bench Press 2", type: "strength", position: { x: -20, z: -15 }, status: "busy", description: "Incline bench for upper chest" },
                { id: "squat1", name: "Squat Rack 1", type: "strength", position: { x: -25, z: -5 }, status: "available", description: "Power rack for squats and heavy lifts" },
                { id: "squat2", name: "Squat Rack 2", type: "strength", position: { x: -20, z: -5 }, status: "maintenance", description: "Power rack with platform" }
            ]
        },
        {
            id: "freeWeights",
            name: "Free Weights",
            position: { x: -30, z: 15 },
            size: { width: 25, length: 20 },
            color: "#4ade80",
            machines: [
                { id: "dumbbellRack1", name: "Dumbbell Rack", type: "strength", position: { x: -25, z: 10 }, status: "available", description: "Set of dumbbells from 5-30kg" },
                { id: "barbellRack1", name: "Barbell Rack", type: "strength", position: { x: -20, z: 10 }, status: "available", description: "Olympic barbells" },
                { id: "cable1", name: "Cable Machine", type: "strength", position: { x: -25, z: 20 }, status: "busy", description: "Dual adjustable pulley system" }
            ]
        },
        {
            id: "cardio",
            name: "Cardio Section",
            position: { x: 0, z: -10 },
            size: { width: 25, length: 20 },
            color: "#f87171",
            machines: [
                { id: "treadmill1", name: "Treadmill 1", type: "cardio", position: { x: 5, z: -15 }, status: "available", description: "Commercial grade treadmill with incline" },
                { id: "treadmill2", name: "Treadmill 2", type: "cardio", position: { x: 10, z: -15 }, status: "busy", description: "Commercial grade treadmill with incline" },
                { id: "bike1", name: "Exercise Bike 1", type: "cardio", position: { x: 5, z: -5 }, status: "available", description: "Upright exercise bike" },
                { id: "elliptical1", name: "Elliptical 1", type: "cardio", position: { x: 10, z: -5 }, status: "available", description: "Low-impact cardio machine" }
            ]
        },
        {
            id: "stretching",
            name: "Stretching Area",
            position: { x: 0, z: 15 },
            size: { width: 25, length: 20 },
            color: "#a78bfa",
            machines: [
                { id: "yogaMat1", name: "Yoga Mat 1", type: "functional", position: { x: 5, z: 10 }, status: "available", description: "Padded mat for floor exercises" },
                { id: "yogaMat2", name: "Yoga Mat 2", type: "functional", position: { x: 10, z: 10 }, status: "available", description: "Padded mat for floor exercises" },
                { id: "foamRoller1", name: "Foam Roller", type: "functional", position: { x: 5, z: 20 }, status: "available", description: "Self-myofascial release tool" }
            ]
        },
        {
            id: "functional",
            name: "Functional Training",
            position: { x: 30, z: -10 },
            size: { width: 25, length: 20 },
            color: "#60a5fa",
            machines: [
                { id: "trx1", name: "TRX Station", type: "functional", position: { x: 25, z: -15 }, status: "available", description: "Suspension training system" },
                { id: "kettlebell1", name: "Kettlebell Rack", type: "functional", position: { x: 30, z: -15 }, status: "available", description: "Various weight kettlebells" },
                { id: "boxJump1", name: "Box Jump Platform", type: "functional", position: { x: 25, z: -5 }, status: "available", description: "Adjustable height platform" }
            ]
        },
        {
            id: "reception",
            name: "Reception",
            position: { x: 30, z: 15 },
            size: { width: 25, length: 20 },
            color: "#f59e0b",
            machines: [
                { id: "receptionDesk", name: "Reception Desk", type: "other", position: { x: 25, z: 10 }, status: "busy", description: "Front desk for check-ins" },
                { id: "currentUser", name: "You are here", type: "user", position: { x: 30, z: 20 }, status: "active", description: "Your current location" }
            ]
        }
    ],
    workoutPlans: {
        current: "strengthTraining", // Default selected plan
        plans: {
            strengthTraining: {
                name: "Strength Training",
                description: "Build muscle and strength with compound movements",
                exercises: [
                    { id: 1, name: "Warm-up", machineId: "treadmill1", duration: "10 min", completed: false },
                    { id: 2, name: "Bench Press", machineId: "benchPress1", sets: "4 x 8 reps", completed: false },
                    { id: 3, name: "Squats", machineId: "squat1", sets: "4 x 10 reps", completed: false },
                    { id: 4, name: "Barbell Rows", machineId: "barbellRack1", sets: "3 x 12 reps", completed: false },
                    { id: 5, name: "Cool Down", machineId: "yogaMat1", duration: "5 min", completed: false }
                ]
            },
            cardioFitness: {
                name: "Cardio Fitness",
                description: "Improve cardiovascular health and endurance",
                exercises: [
                    { id: 1, name: "HIIT Treadmill", machineId: "treadmill1", duration: "15 min", completed: false },
                    { id: 2, name: "Exercise Bike", machineId: "bike1", duration: "20 min", completed: false },
                    { id: 3, name: "Elliptical", machineId: "elliptical1", duration: "15 min", completed: false },
                    { id: 4, name: "Dynamic Stretching", machineId: "yogaMat1", duration: "10 min", completed: false }
                ]
            },
            functionalTraining: {
                name: "Functional Training",
                description: "Improve movement patterns and everyday fitness",
                exercises: [
                    { id: 1, name: "Dynamic Warm-up", machineId: "yogaMat1", duration: "8 min", completed: false },
                    { id: 2, name: "TRX Suspension", machineId: "trx1", sets: "3 x 15 reps", completed: false },
                    { id: 3, name: "Kettlebell Swings", machineId: "kettlebell1", sets: "3 x 20 reps", completed: false },
                    { id: 4, name: "Box Jumps", machineId: "boxJump1", sets: "4 x 12 reps", completed: false },
                    { id: 5, name: "Cable Machine", machineId: "cable1", sets: "3 x 15 reps", completed: false },
                    { id: 6, name: "Foam Rolling", machineId: "foamRoller1", duration: "10 min", completed: false }
                ]
            },
            beginnerFriendly: {
                name: "Beginner Friendly",
                description: "Perfect for those new to fitness",
                exercises: [
                    { id: 1, name: "Light Cardio", machineId: "treadmill1", duration: "10 min", completed: false },
                    { id: 2, name: "Basic Strength", machineId: "dumbbellRack1", sets: "2 x 10 reps", completed: false },
                    { id: 3, name: "Machine Intro", machineId: "cable1", sets: "2 x 12 reps", completed: false },
                    { id: 4, name: "Stretching", machineId: "yogaMat1", duration: "10 min", completed: false }
                ]
            }
        }
    },
    // Keep backward compatibility with the existing code
    get workoutPlan() {
        return this.workoutPlans.plans[this.workoutPlans.current].exercises;
    },
    friends: [
        { id: 1, name: "John D.", machineId: "benchPress2", avatar: "JD", status: "Bench Press • Strength • 15m" },
        { id: 2, name: "Sarah M.", machineId: "treadmill2", avatar: "SM", status: "Treadmill • Cardio • 30m" },
        { id: 3, name: "Mike R.", machineId: "cable1", avatar: "MR", status: "Cable Machine • Free Weights • 20m" },
        { id: 4, name: "Emma W.", machineId: "yogaMat2", avatar: "EW", status: "Yoga • Stretching • 45m" },
        { id: 5, name: "Tom K.", machineId: "bike1", avatar: "TK", status: "Exercise Bike • Cardio • 25m" }
    ]
}; 