-- Create email_logs table for PostgreSQL/Supabase in nixty schema
-- This table tracks all email sending attempts, successes, and failures

CREATE TABLE IF NOT EXISTS nixty.email_logs (
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(255),
    recipients TEXT NOT NULL,
    email_type VARCHAR(100) DEFAULT 'license_delivery',
    status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
    error_message TEXT,
    email_subject VARCHAR(500),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_logs_order_id ON nixty.email_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON nixty.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON nixty.email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON nixty.email_logs(email_type);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION nixty.update_email_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_email_logs_updated_at
    BEFORE UPDATE ON nixty.email_logs
    FOR EACH ROW
    EXECUTE FUNCTION nixty.update_email_logs_updated_at();

-- Add comments for documentation
COMMENT ON TABLE nixty.email_logs IS 'Tracks all email sending attempts including successes and failures';
COMMENT ON COLUMN nixty.email_logs.order_id IS 'Reference to the order that triggered the email';
COMMENT ON COLUMN nixty.email_logs.recipients IS 'Email addresses that received or should have received the email';
COMMENT ON COLUMN nixty.email_logs.email_type IS 'Type of email sent (license_delivery, order_confirmation, etc.)';
COMMENT ON COLUMN nixty.email_logs.status IS 'Status of the email sending attempt';
COMMENT ON COLUMN nixty.email_logs.error_message IS 'Error details if the email failed to send';
COMMENT ON COLUMN nixty.email_logs.email_subject IS 'Subject line of the email that was sent';
