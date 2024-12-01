module suismartbox::SmartBox {
    use sui::object;
    use sui::tx_context;
    use sui::table;
    use sui::transfer;

    public struct State has key, store {
        id: object::UID,
        active_packages: table::Table<object::ID, bool>
    }

    public struct Package has key, store {
        id: object::UID,
        metadata: vector<u8>,
        cid: vector<u8>,
        customer: address,
        delivered: bool,
        funds: u64,
    }

    public fun create_state(ctx: &mut tx_context::TxContext): State {
        State {
            id: object::new(ctx),
            active_packages: table::new(ctx)
        }
    }

    public fun create_package(
        metadata: vector<u8>,
        cid: vector<u8>,
        customer: address,
        state: &mut State,
        ctx: &mut tx_context::TxContext
    ) {
        let package = Package {
            id: object::new(ctx),
            metadata,
            cid,
            customer,
            delivered: false,
            funds: 0,
        };
        
        table::add(&mut state.active_packages, object::id(&package), true);
        transfer::transfer(package, customer);
    }

    public fun mark_as_delivered(package: &mut Package, state: &mut State) {
        package.delivered = true;
        table::remove(&mut state.active_packages, object::id(package));
    }

    public fun get_package_details(package: &Package): (address, vector<u8>, vector<u8>, bool, u64) {
        (
            package.customer, 
            package.metadata, 
            package.cid, 
            package.delivered, 
            package.funds
        )
    }

    public fun destroy_state(state: State) {
        let State { id, active_packages } = state;
        object::delete(id);
        table::destroy_empty(active_packages);
    }
}