{
    "name": "Complaint Notification System",
    "nodes": [
      {
        "parameters": {
          "path": "complaint-received",
          "options": {}
        },
        "name": "Webhook",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1,
        "position": [
          250,
          300
        ]
      },
      {
        "parameters": {
          "fromEmail": "your-email@example.com",
          "toEmail": "={{$json.email}}",
          "subject": "Complaint Received - Reference ID: {{$json.complaintId}}",
          "text": "Dear Citizen,\n\nYour complaint has been received and is being processed.\n\nComplaint Details:\nCategory: {{$json.category}}\nLocation: {{$json.location}}\nDescription: {{$json.description}}\nStatus: {{$json.status}}\n\nYou can track your complaint status using your complaint ID: {{$json.complaintId}}\n\nThank you for helping us improve our city.\n\nBest regards,\nCity Grievance Portal Team",
          "options": {}
        },
        "name": "Send Email",
        "type": "n8n-nodes-base.emailSend",
        "typeVersion": 1,
        "position": [
          450,
          300
        ]
      }
    ],
    "connections": {
      "Webhook": {
        "main": [
          [
            {
              "node": "Send Email",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    },
    "active": true,
    "settings": {},
    "versionId": "1",
    "id": "1",
    "meta": {
      "instanceId": "1"
    },
    "tags": []
  }
  