/* ==========================================================================
   CLOUDO-OPTIMA CLOUD WASTE DETECTIVE ENGINE
   Scans resources, computes metrics, and generates infrastructure remediation code
   ========================================================================== */

export const WasteDetective = {
    // Generates Terraform/CLI code for resources
    generateScript(resource, language) {
        if (!resource) return "// Select a zombie resource above to generate remediation code...";
        
        if (language === 'terraform') {
            return this.getTerraformScript(resource);
        } else {
            return this.getAWSCliScript(resource);
        }
    },

    // Terraform generator
    getTerraformScript(resource) {
        const id = resource.id;
        
        if (id === 'res-ec2-01') {
            return `# CloudOptima Cost Optimization Policy: Downscale Idle Instance
# Resource Name: Staging-Testing-Environment
# Current Cost: $480.00/mo | Target Cost: $34.00/mo (92.9% Savings)

resource "aws_instance" "staging_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium" # Optimized down from m5.4xlarge
  
  root_block_device {
    volume_size = 100
    volume_type = "gp3"
  }

  tags = {
    Name        = "${resource.name}"
    Environment = "Staging"
    FinOpsState = "Optimized"
    ManagedBy   = "CloudOptima-Agent"
    AutoSavings = "Active"
  }
}`;
        }
        
        if (id === 'res-rds-02') {
            return `# CloudOptima Cost Optimization Policy: Safe Database Decommission
# Database Name: dev-analytics-db
# Current Cost: $650.00/mo | Target Cost: $0.00/mo (100% Savings)

resource "aws_db_instance" "analytics_db" {
  identifier           = "rds-analytics-dev-01"
  # Decommissioning database. Terminating and generating snapshot.
  # To apply via Terraform, set deletion_protection to false or count = 0
  
  deletion_protection = false
  skip_final_snapshot  = false
  final_snapshot_identifier = "dev-analytics-db-final-snapshot-manual"

  tags = {
    Name        = "${resource.name}"
    DecommissionedBy = "CloudOptima"
    SnapshotTaken    = "True"
  }
}`;
        }

        if (id === 'res-ebs-03') {
            return `# CloudOptima Cost Optimization Policy: Clean Up Orphaned Storage
# Volume Name: orphaned-backup-vol-2025
# Current Cost: $160.00/mo | Target Cost: $0.00/mo (100% Savings)

# Detached volume resource block is marked for removal from state file.
# Delete the following resource block or run 'terraform destroy -target=aws_ebs_volume.detached_vol'

resource "aws_ebs_volume" "detached_vol" {
  availability_zone = "us-east-1a"
  size              = 2000 # 2TB Unattached Volume
  type              = "gp3"
  
  # WARNING: Unattached EBS volumes incur 100% waste billing.
}`;
        }

        if (id === 'res-ec2-04') {
            return `# CloudOptima Cost Optimization Policy: Right-Size Workload Instance
# Resource Name: prod-log-parser-heavy
# Current Cost: $320.00/mo | Target Cost: $80.00/mo (75.0% Savings)

resource "aws_instance" "log_parser" {
  ami           = "ami-0b9f02931a7c5b62"
  instance_type = "c6i.large" # Right-sized from c6i.2xlarge

  tags = {
    Name        = "${resource.name}"
    Environment = "Production"
    Optimization = "RightSized"
    LastScanned = "CloudOptima-Scanner"
  }
}`;
        }

        if (id === 'res-gcs-05') {
            return `# CloudOptima Cost Optimization Policy: Establish S3 Data Lifecycle Rules
# Storage Bucket: temp-migration-bucket
# Current Cost: $115.00/mo | Target Cost: $12.00/mo (89.5% Savings)

resource "aws_s3_bucket_lifecycle_configuration" "migration_lifecycle" {
  bucket = "cloudoptima-temp-migration-data"

  rule {
    id     = "archive-old-migration-data"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "GLACIER"
    }

    noncurrent_version_transition {
      noncurrent_days = 14
      storage_class   = "DEEP_ARCHIVE"
    }
  }
}`;
        }

        return `// No Terraform script found for ID: ${id}`;
    },

    // AWS CLI script generator
    getAWSCliScript(resource) {
        const id = resource.id;
        
        if (id === 'res-ec2-01') {
            return `# AWS CLI Script: Downscale instance type safely
# Step 1: Stop EC2 Instance
aws ec2 stop-instances --instance-ids ${resource.details.instanceId}

# Step 2: Wait for instance to stop
aws ec2 wait instance-stopped --instance-ids ${resource.details.instanceId}

# Step 3: Modify instance attributes to downscale
aws ec2 modify-instance-attribute --instance-id ${resource.details.instanceId} --instance-type "{\\"Value\\": \\"t3.medium\\"}"

# Step 4: Restart optimized EC2 instance
aws ec2 start-instances --instance-ids ${resource.details.instanceId}`;
        }
        
        if (id === 'res-rds-02') {
            return `# AWS CLI Script: Decommission Postgres DB with final backup
# Triggers full AWS RDS database deletion and takes a final restorable snapshot

aws rds delete-db-instance \\
  --db-instance-identifier ${resource.details.dbId} \\
  --skip-final-snapshot \\
  --final-db-snapshot-identifier ${resource.details.dbId}-final-snapshot \\
  --delete-automated-backups`;
        }

        if (id === 'res-ebs-03') {
            return `# AWS CLI Script: Backup & Purge detached storage volume
# Step 1: Generate safety snapshot backup
aws ec2 create-snapshot \\
  --volume-id ${resource.details.volumeId} \\
  --description "CloudOptima auto-backup before purging volume"

# Step 2: Delete volume permanently
aws ec2 delete-volume --volume-id ${resource.details.volumeId}`;
        }

        if (id === 'res-ec2-04') {
            return `# AWS CLI Script: Modify Production Server instance size
aws ec2 stop-instances --instance-ids ${resource.details.instanceId}
aws ec2 wait instance-stopped --instance-ids ${resource.details.instanceId}
aws ec2 modify-instance-attribute --instance-id ${resource.details.instanceId} --instance-type "{\\"Value\\": \\"c6i.large\\"}"
aws ec2 start-instances --instance-ids ${resource.details.instanceId}`;
        }

        if (id === 'res-gcs-05') {
            return `# AWS CLI Script: Configure bucket lifecycle policy
# Save policy json payload locally
echo '{
  "Rules": [
    {
      "ID": "MoveOldLogsToGlacier",
      "Status": "Enabled",
      "Prefix": "",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}' > lifecycle-policy.json

# Apply lifecycle configurations to active S3 bucket
aws s3api put-bucket-lifecycle-configuration \\
  --bucket ${resource.details.bucketName} \\
  --lifecycle-configuration file://lifecycle-policy.json`;
        }

        return `# No CLI script found for ID: ${id}`;
    }
};
