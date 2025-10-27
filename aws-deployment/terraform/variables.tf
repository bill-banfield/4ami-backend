# General Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "ami-backend"
}

variable "unique_suffix" {
  description = "Unique suffix for resource naming to prevent conflicts"
  type        = string
  default     = ""
}

# Database Variables
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "ami_db"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "ami_user"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot when destroying RDS instance"
  type        = bool
  default     = false
}

variable "deletion_protection" {
  description = "Enable deletion protection for RDS instance"
  type        = bool
  default     = true
}

# ECS Variables
variable "task_cpu" {
  description = "CPU units for the ECS task (256, 512, 1024, 2048, 4096)"
  type        = number
  default     = 512
}

variable "task_memory" {
  description = "Memory for the ECS task in MB"
  type        = number
  default     = 1024
}

variable "desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1
}

# Application Variables
variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "mail_host" {
  description = "SMTP host for email"
  type        = string
  default     = "smtp.gmail.com"
}

variable "mail_port" {
  description = "SMTP port for email"
  type        = string
  default     = "587"
}

variable "mail_user" {
  description = "SMTP username for email"
  type        = string
}

variable "mail_pass" {
  description = "SMTP password for email"
  type        = string
  sensitive   = true
}

variable "mail_from" {
  description = "From email address"
  type        = string
  default     = "noreply@4ami.com"
}

variable "frontend_url" {
  description = "Frontend URL"
  type        = string
  default     = "https://your-frontend-domain.com"
}
