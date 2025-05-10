require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Initialize Supabase client
const supabaseUrl = 'https://mrnqxqzloowrokgggufr.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();

// Configure CORS
app.use(cors());
app.use(express.json());

// Dummy credentials for testing
const DUMMY_CREDENTIALS = {
    email: 'admin@example.com',
    password: 'admin123'
};

// Simple login endpoint
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (email === DUMMY_CREDENTIALS.email && password === DUMMY_CREDENTIALS.password) {
        res.json({
            token: 'dummy-token',
            user: {
                email: email,
                role: 'government'
            }
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Submit new complaint
app.post('/api/complaints', async (req, res) => {
    try {
        const { category, location, description, email, conversation_id } = req.body;
        
        const { data: complaint, error } = await supabase
            .from('complaints')
            .insert([
                {
                    category,
                    location,
                    description,
                    email,
                    conversation_id,
                    status: 'pending',
                    timeline: [
                        {
                            status: 'pending',
                            description: 'Complaint submitted',
                            timestamp: new Date().toISOString()
                        }
                    ]
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Trigger n8n webhook for email notification
        try {
            console.log('Sending webhook to n8n with data:', {
                complaintId: complaint.id,
                email: email,
                category: category,
                location: location,
                description: description,
                status: 'pending'
            });

            const webhookResponse = await fetch('https://davidmolad.app.n8n.cloud/webhook-test/complaint-received', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    complaintId: complaint.id,
                    email: email,
                    category: category,
                    location: location,
                    description: description,
                    status: 'pending'
                })
            });

            console.log('n8n webhook response status:', webhookResponse.status);
            const webhookData = await webhookResponse.text();
            console.log('n8n webhook response:', webhookData);

            if (!webhookResponse.ok) {
                throw new Error(`n8n webhook failed with status ${webhookResponse.status}`);
            }
        } catch (webhookError) {
            console.error('Error triggering n8n webhook:', webhookError);
            // Don't throw the error as we still want to return the complaint data
        }

        // Return the complaint with its ID
        res.status(201).json({
            id: complaint.id,
            ...complaint
        });
    } catch (error) {
        console.error('Error submitting complaint:', error);
        res.status(500).json({ error: 'Failed to submit complaint' });
    }
});

// Get all complaints with filters
app.get('/api/complaints', async (req, res) => {
    try {
        const { status, category, search } = req.query;
        
        let query = supabase
            .from('complaints')
            .select('*')
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }
        
        if (category) {
            query = query.eq('category', category);
        }
        
        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data: complaints, error } = await query;

        if (error) throw error;

        res.json(complaints);
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
});

// Get single complaint
app.get('/api/complaints/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: complaint, error } = await supabase
            .from('complaints')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }

        res.json(complaint);
    } catch (error) {
        console.error('Error fetching complaint:', error);
        res.status(500).json({ error: 'Failed to fetch complaint' });
    }
});

// Update complaint status
app.put('/api/complaints/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comments } = req.body;

        // First get the current complaint to access its timeline
        const { data: currentComplaint, error: fetchError } = await supabase
            .from('complaints')
            .select('timeline')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // Create new timeline entry
        const newTimelineEntry = {
            status,
            description: comments,
            timestamp: new Date().toISOString()
        };

        // Update the complaint with new status and append to timeline
        const { data: updatedComplaint, error } = await supabase
            .from('complaints')
            .update({
                status,
                timeline: [...(currentComplaint.timeline || []), newTimelineEntry]
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json(updatedComplaint);
    } catch (error) {
        console.error('Error updating complaint:', error);
        res.status(500).json({ error: 'Failed to update complaint' });
    }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 
