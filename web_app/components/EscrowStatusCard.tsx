'use client';

import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Shield } from 'lucide-react';
import type { Escrow } from '@/types';

interface EscrowStatusCardProps {
    escrow: Escrow;
}

export function EscrowStatusCard({ escrow }: EscrowStatusCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'held':
                return 'bg-blue-100 text-blue-800';
            case 'released':
                return 'bg-green-100 text-green-800';
            case 'refunded':
                return 'bg-gray-100 text-gray-800';
            case 'disputed':
                return 'bg-amber-100 text-amber-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusMessage = () => {
        switch (escrow.status) {
            case 'held':
                return 'Funds are securely held in escrow until task completion';
            case 'released':
                return 'Payment has been released to the tasker';
            case 'refunded':
                return 'Payment has been refunded';
            case 'disputed':
                return 'Payment is on hold due to an active dispute';
            default:
                return '';
        }
    };

    const getGatewayName = () => {
        if (escrow.paymentGateway === 'PLACEHOLDER_PAYNOW') return 'Paynow';
        if (escrow.paymentGateway === 'PLACEHOLDER_PESAPAL') return 'Pesapal';
        return 'Virtual Escrow';
    };

    return (
        <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-green-600" />
                <h3 className="font-heading text-lg font-bold text-[#1a2847]" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                    Payment Protection
                </h3>
            </div>

            {/* Amount */}
            <div className="mb-4">
                <div className="text-xs text-gray-600 mb-1">AMOUNT</div>
                <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <span className="font-heading text-3xl font-bold text-[#1a2847]" style={{ fontFamily: 'var(--font-fjalla), "Fjalla One", sans-serif' }}>
                        ${escrow.amount}
                    </span>
                </div>
            </div>

            {/* Status */}
            <div className="mb-4">
                <div className="text-xs text-gray-600 mb-2">STATUS</div>
                <Badge className={`${getStatusColor(escrow.status)} hover:${getStatusColor(escrow.status)}`}>
                    {escrow.status.toUpperCase()}
                </Badge>
                <p className="text-xs text-gray-600 mt-2">
                    {getStatusMessage()}
                </p>
            </div>

            {/* Payment Gateway */}
            <div className="mb-4 pb-4 border-b">
                <div className="text-xs text-gray-600 mb-1">PAYMENT GATEWAY</div>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-gray-100 rounded text-sm font-semibold text-gray-700">
                        {getGatewayName()}
                    </div>
                    {escrow.gatewayTransactionId && (
                        <span className="text-xs text-gray-500">
                            {escrow.gatewayTransactionId}
                        </span>
                    )}
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Held: {new Date(escrow.heldAt).toLocaleDateString()}</span>
                </div>
                {escrow.releasedAt && (
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span>Released: {new Date(escrow.releasedAt).toLocaleDateString()}</span>
                    </div>
                )}
                {escrow.refundedAt && (
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Refunded: {new Date(escrow.refundedAt).toLocaleDateString()}</span>
                    </div>
                )}
                {escrow.releaseScheduledFor && escrow.status === 'held' && (
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>Auto-release: {new Date(escrow.releaseScheduledFor).toLocaleDateString()}</span>
                    </div>
                )}
            </div>

            {escrow.notes && (
                <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-600 italic">{escrow.notes}</p>
                </div>
            )}
        </div>
    );
}
