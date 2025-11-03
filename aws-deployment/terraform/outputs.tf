# VPC Information
output "vpc_id" {
  description = "ID of the VPC"
  value       = data.aws_vpc.default.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = data.aws_subnets.default.ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = data.aws_subnets.default.ids
}

# Database Information
output "rds_endpoint" {
  description = "RDS instance endpoint (includes port)"
  value       = aws_db_instance.main.endpoint
}

output "rds_address" {
  description = "RDS instance address (hostname only)"
  value       = aws_db_instance.main.address
}

output "rds_port" {
  description = "RDS instance port"
  value       = aws_db_instance.main.port
}

output "database_url" {
  description = "Complete database connection URL"
  value       = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/${var.db_name}"
  sensitive   = true
}

# Load Balancer Information
output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the load balancer"
  value       = aws_lb.main.zone_id
}

output "alb_url" {
  description = "URL of the load balancer"
  value       = "http://${aws_lb.main.dns_name}"
}

# API Information
output "api_url" {
  description = "API base URL"
  value       = "https://${aws_lb.main.dns_name}/api/v1"
}

output "api_docs_url" {
  description = "API documentation URL"
  value       = "https://${aws_lb.main.dns_name}/api/v1/docs"
}

# ECS Information
output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.main.name
}

# ECR Information
output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.main.repository_url
}

# CloudWatch Information
output "cloudwatch_log_group" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.main.name
}
